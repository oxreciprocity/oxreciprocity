// This code is just relevant for the card overlay functionality on the index page
$(document).ready(function () {
  $('.card').click(function () {
    const overlay = $(this).find('.card-overlay');
    if (overlay.css('display') === 'none') {
      overlay.css('display', 'flex').hide().fadeIn(); // Show overlay
      // Store initial form state
      overlay.find('form').each(function () {
        $(this).data('initialState', $(this).serializeArray());
      });
    }
  });

  // Add click handler for the Cancel button
  $('.cancel-btn').click(function () {
    const form = $(this).closest('form');
    $(this).closest('.card-overlay').fadeOut(function(){
      restoreFormState(form);
    });
  });

  $('.card-overlay form').submit(function (event) {
    event.preventDefault(); // Prevent default form submission

    const form = $(this); // Reference to the form
    const formData = form.serialize(); // Serialize form data

    $.ajax({
      type: 'POST',
      url: '/submit', // Your endpoint
      data: formData,
      success: function (response) {
        showMessage(form.closest('.card-container'), 'Submission Successful!', 'success');
        form.closest('.card-overlay').fadeOut();
      },
      error: function (xhr) {
        let message = 'Submission failed: ';
        if (xhr.status === 429) {
          message += "you can only express interest in three people per week.";
        } else {
          message += xhr.responseText;
        }
        showMessage(form.closest('.card-container'), message, 'error');
      }
    });
  });

  // Prevent form click from closing the overlay
  $('.overlay-content').click(function(event) {
    event.stopPropagation();
  });
});

function showMessage(container, message, type) {
  const messageElement = $('<div class="message"></div>').text(message);
  let timeout;
  if (type === 'success') {
    messageElement.addClass('alert alert-success');
    timeout = 3000;
  } else {
    messageElement.addClass('alert alert-danger');
    timeout = 5000;
  }
  container.append(messageElement);
  setTimeout(() => {
    messageElement.fadeOut(500, function() {
      $(this).remove();
    });
  }, timeout);
}

// Function to restore the form to its initial state
function restoreFormState(form) {
  const initialState = form.data('initialState');
  form[0].reset(); // Reset the form to clear all current values
  initialState.forEach(field => {
    const element = form.find(`[name="${field.name}"]`);
    if (element.attr('type') === 'checkbox' || element.attr('type') === 'radio') {
      element.prop('checked', field.value === 'true');
    } else {
      element.val(field.value);
    }
  });
}