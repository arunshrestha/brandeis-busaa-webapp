$(document).ready(() => {
  $("#modal-button").click(() => {
    let apiToken = $("#apiToken").data("token");

    $(".modal-body").html("");
    $.get(`/api/events?apiToken=${apiToken}`, (results = {}) => {
      let data = results.data;
      if (!data || !data.events) return;
      data.events.forEach((event) => {
        $(".modal-body").append(
          `<div>
  <span class="event-title">
  ${event.title}
  </span>
  <div class='event-description'>
  ${event.description}
  </div>
  <button class='${event.joined ? "joined-button" : "join-button"}' data-id="${event._id
          }">${event.joined ? "Joined" : "Join"}</button>
      </div>`
        );
      });
    }).then(() => {
      $(".join-button").click((event) => {
        let $button = $(event.target),
          eventId = $button.data("id");
        $.get(
          `/api/events/${eventId}/join?apiToken=${apiToken}`,
          (results = {}) => {
            let data = results.data;
            if (data && data.success) {
              $button
                .text("Joined")
                .addClass("joined-button")
                .removeClass("join-button");
            } else {
              $button.text("Try again");
            }
          }
        );
      });
    });
  });
});

const socket = io();

$("#chatForm").submit(() => {
  let text = $("#chat-input").val(),
    userId = $("#chat-user-id").val(),
    userName = $("#chat-user-name").val();
  socket.emit("message", { content: text, userId: userId, userName: userName });

  $("#chat-input").val("");
  return false;
});
socket.on("message", (message) => {
  displayMessage(message);
  for (let i = 0; i < 2; i++) {
    $(".chat-icon").fadeOut(200).fadeIn(200);
  }
});

socket.on("load all messages", (data) => {
  data.forEach((message) => {
    displayMessage(message);
  });
});

socket.on("user disconnected", () => {
  displayMessage({
    userName: "Notice",
    content: "user left the chat",
  });
});

let displayMessage = (message) => {
  $("#chat").prepend(
    $("<li>").html(`${message.name
      } : <strong class="message ${getCurrentUserClass(message.userName)}
    ">
    ${message.content}</strong>`)
  );
};

let getCurrentUserClass = (id) => {
  let userId = $("#chat-user-id").val();
  return userId === id ? "current-user" : "other-user";
};
