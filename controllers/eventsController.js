const Event = require("../models/event");
const httpStatus = require("http-status-codes");
const User = require("../models/user");

const getEventParams = body => {
  var isOnlineCheckBox;
  (req.body.isOnline == "on") ? isOnlineCheckBox = true : isOnlineCheckBox = false;
  return {
    title: body.title,
    description: body.description,
    location: body.location,
    startDate: body.startDate,
    endDate: body.endDate,
    isOnline: isOnlineCheckBox,
    registrationLink: body.registrationLink,
    organizer: body.organizer,
    attendees: body.attendees,
  };
};
module.exports = {
  index: (req, res, next) => {
    Event.find()
      .then((events) => {
        res.locals.events = events;
        next();
      })
      .catch((error) => {
        console.log(`Error fetching events: ${error.message}`);
        next(error);
      });
  },
  indexView: (req, res) => {
    res.render("events/index");
  },
  new: (req, res) => {
    res.render("events/new");
  },
  create: (req, res, next) => {
    if (req.skip) next();
    var isOnlineCheckBox;
    (req.body.isOnline == "on") ? isOnlineCheckBox = true : isOnlineCheckBox = false;
    let newEvent = new Event(
      {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        isOnline: isOnlineCheckBox,
        registrationLink: req.body.registrationLink,
        organizer: res.locals.currentUser,
        attendees: req.body.attendees
      }
    );
    newEvent.save().then((events) => {
      if (events) {
        req.flash(
          "success",
          `${events.title} created successfully!`
        );
        res.locals.redirect = "/events";
        next();
      } else {
        req.flash(
          "error",
          `Failed to create events account because:${error.message}.`
        );
        res.locals.redirect = "/events/new";
        next();
      }
    });
  },
  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },
  show: (req, res, next) => {
    let eventId = req.params.id;
    Event.findById(eventId)
      .then((event) => {
        res.locals.event = event;
        next();
      })
      .catch((error) => {
        console.log(`Error fetching event by ID: ${error.message}`);
        next(error);
      });
  },
  showView: (req, res) => {
    res.render("events/show");
  },
  edit: (req, res, next) => {
    let eventId = req.params.id;
    Event.findById(eventId)
      .then((event) => {
        res.render("events/edit", {
          event: event,
        });
      })
      .catch((error) => {
        console.log(`Error fetching event by ID: ${error.message}`);
        next(error);
      });
  },
  update: (req, res, next) => {
    let eventId = req.params.id,
      eventParams = getEventParams(req.body);
    Event.findByIdAndUpdate(eventId, {
      $set: eventParams,
    })
      .then((event) => {
        res.locals.redirect = `/events/${eventId}`;
        res.locals.event = event;
        next();
      })
      .catch((error) => {
        console.log(`Error updating event by ID: ${error.message}`);
        next(error);
      });
  },
  delete: (req, res, next) => {
    let eventId = req.params.id;
    Event.findByIdAndDelete(eventId)
      .then(() => {
        res.locals.redirect = "/events";
        next();
      })
      .catch((error) => {
        console.log(`Error deleting event by ID: ${error.message}`);
        next();
      });
  },
  validate: (req, res, next) => {
    req.check("title", "Title is invalid").notEmpty();
    req.check("description", "Description is invalid").notEmpty();
    req.check("location", "Location is invalid").notEmpty();
    req.check("startDate", "Start Date is invalid").notEmpty();
    req.check("endDate", "End Date is invalid").notEmpty();
    req.getValidationResult().then((error) => {
      if (!error.isEmpty()) {
        let messages = error.array().map((e) => e.msg);
        req.skip = true;
        req.flash("error", messages.join(" and "));
        res.locals.redirect = "/jobs/new";
        next();
      } else {
        next();
      }
    });
  },
  respondJSON: (req, res) => {
    res.json({
      status: httpStatus.OK,
      data: res.locals,
    });
  },
  errorJSON: (error, req, res, next) => {
    let errorObject;
    if (error) {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    } else {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Unknown Error.",
      };
    }
    res.json(errorObject);
  },
  join: (req, res, next) => {
    let eventId = req.params.id,
      currentUser = req.user;
    if (currentUser) {
      Event.findByIdAndUpdate(eventId, {
        $addToSet: {
          attendees: currentUser._id,
        },
      }, { new: true })
        .then(() => {
          res.locals.success = true;
          res.locals.redirect = "/events";
          next();
        })
        .catch((error) => {
          next(error);
        });
    } else {
      next(new Error("User must log in."));
    }
  },
  filterUserEvents: (req, res, next) => {
    let currentUser = res.locals.currentUser;
    if (currentUser) {
      let mappedEvents = res.locals.events.map((event) => {
        // Check if the current user has joined the event
        let userJoined = event.attendees.some((attendeeId) => {
          return attendeeId.equals(currentUser.id);
        });
        // Add a 'joined' property to the event object indicating whether the user has joined
        return Object.assign(event.toObject(), { joined: userJoined });
      });
      // Update res.locals.events with the mapped events
      res.locals.events = mappedEvents;
      // Continue to the next middleware
      next();
    } else {
      // If there is no current user, continue to the next middleware
      next();
    }
  },
};
