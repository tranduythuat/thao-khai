// document.addEventListener("DOMContentLoaded", () => {
//     const rsvp = document.getElementById('rsvp-btn');
//     rsvp.addEventListener("click", toggleRsvp);
// })

function toggleRsvp(e) {
    e.preventDefault();

    Swal.fire({
        title: "Attendance confirmation <br> <span class='confirm-sub-vn'>/Xác nhận tham dự/</span>",
        html: `
            <form id="rsvpForm" style="text-align:left">
                <label for="name" style="display:block;margin-bottom:6px;">
                    Your Name? <br>
                    Tên của bạn?
                </label>
                <input id="name" name="name" type="text" placeholder="" required class="form-input" style="width:100%"/>
                <label for="confirm" style="display:block;margin-bottom:6px;">
                    Will you be there to celebrate our wedding with us? <br>
                    Bạn có tham dự lễ cưới của chúng mình không?
                </label>
                <select id="confirm" required name="confirm" class="form-input" style="width:100%">
                    <option value="" disabled selected>-- Please select (Vui lòng chọn) --</option>
                    <option value="yes">Yes, I'll be there (Có, tôi sẽ tham dự)</option>
                    <option value="no">Sorry, can't make it (Không, tôi không tham dự được)</option>
                </select>

                <label for="guest-number" style="display:block;margin-bottom:6px;">
                    Number of attendees <br>
                    Số khách tham dự
                </label>
                <select id="guest-number" required name="guest_number" class="form-input" style="width:100%">
                    <option value="" disabled selected>-- Please select (Vui lòng chọn) --</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
        
                <label for="after-party" style="display:block;margin:12px 0 6px;">
                    And are you ready to party with us at the after party? <br>
                    Bạn có quẩy cùng chúng mình ở after party không?
                </label>
                <select id="after-party" name="after_party" class="form-input" style="width:100%">
                    <option value="" disabled selected>-- Please select (Vui lòng chọn) --</option>
                    <option value="yes">Yes, I'll be there (Có, tôi sẽ tham dự)</option>
                    <option value="no">Sorry, can't make it (Không, tôi không tham dự được)</option>
                </select>
                <label for="wish" style="display:block;margin-bottom:6px;">
                    Write a wish for the bride and groom! <br>
                    Hãy dành những lời chúc tốt đẹp nhất gửi đến <br> Xuân Duy và Mai Anh nhé!
                </label>
                <textarea style="width:100%" class="form-input"
                    id="wish"
                    name="wish"
                    placeholder=""
                ></textarea>
            </form>
        `,
        confirmButtonText: "Confirm",
        confirmButtonColor: "#c9b079",
        showCancelButton: true,
        cancelButtonText: "Close",
        focusConfirm: false,

        preConfirm: () => {
            const name = document.getElementById("name").value;
            const confirm = document.getElementById("confirm").value;
            const guestNumber = document.getElementById("guest-number").value;
            const afterParty = document.getElementById("after-party").value;
            const wish = document.getElementById("wish").value;

            if (!name) {
                Swal.showValidationMessage("Vui lòng điền tên của bạn - /Please fill in your name./");
                return false;
            }

            if (!confirm) {
                Swal.showValidationMessage("Please select confirm attendance - /Vui lòng chọn xác nhận tham dự/");
                return false;
            }

            return {
                name,
                confirm,
                guest_number: guestNumber,
                after_party: afterParty,
                wish
            };
        }
    }).then(async (result) => {
        if (!result.isConfirmed) return;
        console.log("RSVP data:", result.value);
        const data = result.value;
        const {
            name = data.name,
            confirm = data.confirm,
            guest_number = data.guest_number,
            after_party = data.after_party,
            wish = data.after_party,
        } = data;

        Swal.fire({
            title: 'Sending ...',
            text: "Please wait a moment.",
            icon: "info",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });
        const url = "/exec?sheet=confirm";

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    name,
                    confirm,
                    guest_number,
                    after_party,
                    wish
                }),
            });

            const result = await res.json().catch(() => ({}));
            console.log("Server response:", result);
            if (Object.keys(result).length === 0) {
                Swal.fire({
                    title: "Lỗi!",
                    text: "OPPS! Server not found!",
                    icon: "error",
                    confirmButtonText: "Try again",
                    confirmButtonColor: "#000",
                });

                return;
            }

            // Thông báo thành công
            Swal.fire({
                title: "Success!",
                text: "Thank you for your feedback; the information has already been sent to the bride and groom.",
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: "#000",
            });
        } catch (error) {
            console.error("Error:", error);

            // Thông báo lỗi
            Swal.fire({
                title: "Lỗi!",
                text: "OPPS! Something went wrong: " + error.message,
                icon: "error",
                confirmButtonText: "Try again",
                confirmButtonColor: "#000",
            });
        }
    });
}
