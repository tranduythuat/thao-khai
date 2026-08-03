(() => {
    "use strict";

    /* ======================================================
         HELPERS
      ====================================================== */
    const qs = (selector, parent = document) => parent.querySelector(selector);
    var SUPPORTED_LANGS = ["vi", "zh"];

    const qsa = (selector, parent = document) =>
        parent.querySelectorAll(selector);

    function getLangFromURL() {
        var params = new URLSearchParams(window.location.search);
        var lang = params.get("lang");
        return isSupported(lang) ? lang : null;
    }
    function isSupported(lang) {
        return SUPPORTED_LANGS.indexOf(lang) !== -1;
    }

    /* ======================================================
         RSVP
      ====================================================== */

    function toggleAttendanceOptions(isAttending) {
        const moveInputs = qsa('input[name="move"]');
        const stayInputs = qsa('input[name="stay"]');
        const relatedInputs = [...moveInputs, ...stayInputs];
        const relatedGroups = qsa('.form-group.move, .form-group.stay');

        relatedInputs.forEach((input) => {
            input.disabled = !isAttending;
            if (!isAttending) {
                input.checked = false;
            }
        });

        relatedGroups.forEach((group) => {
            group.classList.toggle('is-disabled', !isAttending);
        });
    }

    let syncAttendanceOptions = () => { };

    async function handleFormSubmit(e, lang = "vi") {
        e.preventDefault();
        const form = document.forms["rsvpForm"];
        // var urlLang = getLangFromURL();
        // lang = urlLang

        // form.addEventListener("submit", (e) => {
        //   e.preventDefault();

        //   const data = new FormData(form);
        //   console.log(Object.fromEntries(data));
        // });
        if (!form) {
            return;
        }

        // const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const {
            name,
            confirm,
            guests_number,
            move,
            stay,
            wish,
        } = data;

        const shouldClearSupportOptions = confirm === "No";
        const normalizedMove = shouldClearSupportOptions ? "" : (move || "");
        const normalizedStay = shouldClearSupportOptions ? "" : (stay || "");

        // =========================
        // i18n Messages
        // =========================
        const messages = {
            vi: {
                sendingTitle: "Đang gửi...",
                sendingText: "Vui lòng chờ trong giây lát",
                successTitle: "Thành công!",
                successText:
                    "Cảm ơn bạn đã xác nhận. Thông tin đã được chuyển đến cô dâu và chú rể rồi nha.",
                errorTitle: "Lỗi!",
                errorServer: "OPPS! Không tìm thấy server",
                errorRetry: "Thử lại",
            },
            zh: {
                sendingTitle: "正在提交...",
                sendingText: "请稍候",
                successTitle: "提交成功！",
                successText: "感谢您的回复。您的确认信息已成功发送给新郎和新娘。",
                errorTitle: "发生错误！",
                errorServer: "哎呀！无法连接到服务器。",
                errorRetry: "重试",
            },
        };

        const t = messages[lang] || messages.vi;

        // =========================
        // Loading popup
        // =========================
        Swal.fire({
            title: t.sendingTitle,
            text: t.sendingText,
            icon: "info",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        const sheetURL = "https://script.google.com/macros/s/AKfycbzLa3DvePNdHFgMOOXYwE3h5q3dme-wryKI3HhBKfDHIza4u7m6cCGtD43JITSQeJU3cA/exec?sheet=confirm";

        try {
            const res = await fetch(sheetURL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    name,
                    confirm,
                    guests_number,
                    move: normalizedMove,
                    stay: normalizedStay,
                    wish,
                }),
            });

            // Nếu server lỗi HTTP
            if (!res.ok) {
                throw new Error("Server response not OK");
            }

            const result = await res.json().catch(() => null);

            if (!result) {
                Swal.fire({
                    title: t.errorTitle,
                    text: t.errorServer,
                    icon: "error",
                    confirmButtonText: t.errorRetry,
                    confirmButtonColor: "#3c7fc2",
                });
                return;
            }

            form.reset();
            setTimeout(syncAttendanceOptions, 0);

            Swal.fire({
                title: t.successTitle,
                text: t.successText,
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: "#3c7fc2",
            });
        } catch (error) {
            console.error("Error:", error);

            Swal.fire({
                title: t.errorTitle,
                text: error.message || t.errorServer,
                icon: "error",
                confirmButtonText: t.errorRetry,
                confirmButtonColor: "#3c7fc2",
            });
        }
    }

    function initRSVP() {
        const form = document.forms["rsvpForm"];
        if (!form) {
            return;
        }

        const confirmGroup = qs('.form-group.confirm', form);
        const confirmInputs = Array.from(qsa('input[name="confirm"]', form));
        syncAttendanceOptions = () => {
            const isAttending = confirmInputs.some((input) => input.checked && input.value === "Yes");
            toggleAttendanceOptions(isAttending);
        };

        form.addEventListener("reset", syncAttendanceOptions);

        if (confirmGroup) {
            confirmGroup.addEventListener("click", (event) => {
                if (event.target.closest('input[name="confirm"], label[for]')) {
                    setTimeout(syncAttendanceOptions, 0);
                }
            });
        }

        form.addEventListener("change", (event) => {
            if (event.target && event.target.name === "confirm") {
                syncAttendanceOptions();
            }
        });

        confirmInputs.forEach((input) => {
            input.addEventListener("keydown", (event) => {
                if (event.key === " " || event.key === "Enter") {
                    setTimeout(syncAttendanceOptions, 0);
                }
            });
        });

        syncAttendanceOptions();
        form.addEventListener("submit", (e) => handleFormSubmit(e, "en"));
    }


    /* ======================================================
         BOOTSTRAP
      ====================================================== */

    function init() {
        gsap.registerPlugin(ScrollTrigger);
        initRSVP();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
