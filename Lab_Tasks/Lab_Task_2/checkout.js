document.getElementById('checkoutForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    resetErrors();

    let formValid = true;

    const fullName = document.getElementById('fullName');
    if (!fullName.value.match(/^[A-Za-z ]+$/)) {
        formValid = false;
        document.getElementById('fullNameError').textContent = "Only alphabets are allowed.";
        fullName.classList.add('invalid');
    }

    const email = document.getElementById('email');
    if (!email.value) {
        formValid = false;
        document.getElementById('emailError').textContent = "Email is required.";
        email.classList.add('invalid');
    }

    const phone = document.getElementById('phone');
    if (!phone.value.match(/^\d{10}$/)) {
        formValid = false;
        document.getElementById('phoneError').textContent = "Phone number must be 10 digits.";
        phone.classList.add('invalid');
    }

    const address = document.getElementById('address');
    if (!address.value) {
        formValid = false;
        document.getElementById('addressError').textContent = "Address is required.";
        address.classList.add('invalid');
    }

    const cardNumber = document.getElementById('cardNumber');
    if (!cardNumber.value.match(/^\d{16}$/)) {
        formValid = false;
        document.getElementById('cardNumberError').textContent = "Card number must be 16 digits.";
        cardNumber.classList.add('invalid');
    }

    const expiryDate = document.getElementById('expiryDate');
    const currentDate = new Date();
    const expiry = new Date(expiryDate.value);
    if (!expiryDate.value || expiry <= currentDate) {
        formValid = false;
        document.getElementById('expiryDateError').textContent = "Please enter a valid future expiry date.";
        expiryDate.classList.add('invalid');
    }

    const cvv = document.getElementById('cvv');
    if (!cvv.value.match(/^\d{3}$/)) {
        formValid = false;
        document.getElementById('cvvError').textContent = "CVV must be 3 digits.";
        cvv.classList.add('invalid');
    }

    if (formValid) {
        alert("Form submitted successfully!");
        document.getElementById('checkoutForm').reset();
    }
});

function resetErrors() {
    document.querySelectorAll('.error').forEach(error => error.textContent = '');
    document.querySelectorAll('input, textarea').forEach(input => input.classList.remove('invalid'));
}
