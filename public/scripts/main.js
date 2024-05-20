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
        showMessage('Submission Successful!', 'success');
        form.closest('.card-overlay').fadeOut();
      },
      error: function (xhr) {
        let message = 'Submission failed: ';
        if (xhr.status === 429) {
          try {
            // Parse the JSON response from the server
            const response = JSON.parse(xhr.responseText);
 
            // Construct a base message for rate limiting
            message += "You can only express interest in three people per week. ";
 
            // If retryTime is available, append a formatted retry time to the message
            if (response.retryTime) {
              // Convert retryTime to a Date object
              const retryDate = new Date(response.retryTime);
 
              // Format retryDate (adjust formatting as needed)
              const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' };
              const readableDate = retryDate.toLocaleDateString("en-GB", options);
 
              message += `Please try again on ${readableDate}. <br>(click to close)`;
            } else {
              // Fallback for when retryTime isn't specified in the response
              message += "Please try again later.";
            }
          } catch (e) {
            // Fallback in case of parsing error or unexpected response structure
            message += "Please try again later.";
          }
        } else {
          message += xhr.responseText;
        }
        showMessage(message, 'error');
      }
    });
  });

  // Prevent form click from closing the overlay
  $('.overlay-content').click(function(event) {
    event.stopPropagation();
  });
});

function showMessage(message, type) {
  const messageElement = $('<div class="message"></div>').html(message);
  if (type === 'success') {
    messageElement.addClass('alert alert-success');
    // Set a timeout for success messages to fade out after 3 seconds
    setTimeout(() => {
      messageElement.fadeOut(500, function() {
        $(this).remove();
      });
    }, 3000); // 3 seconds
  } else {
    messageElement.addClass('alert alert-danger');
    // For failure messages, allow them to stay until clicked
    messageElement.click(function() {
      $(this).fadeOut(500, function() {
        $(this).remove();
      });
    });
  }

  $('#message-container').append(messageElement);
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