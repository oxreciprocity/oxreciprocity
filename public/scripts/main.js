$(document).ready(function () {
  // Confirmation dialogue for deleting account
  $('#delete-account-form').submit(function (event) {
    const confirmation = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmation) {
      event.preventDefault();
    }
  });

  // Date in footer
  document.getElementById('current-year').textContent = new Date().getFullYear();
});