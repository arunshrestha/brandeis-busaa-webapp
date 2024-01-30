const Job = require("../models/job");

const getJobParams = body => {
  var isActiveCheckBox;
  (body.isActive == "on") ? isActiveCheckBox = true : isActiveCheckBox = false;
  return {
    title: body.title,
    company: body.company,
    location: body.location,
    description: body.description,
    requirements: body.requirements,
    salary: body.salary,
    contactEmail: body.contactEmail,
    contactPhone: body.contactPhone,
    postDate: body.postDate,
    deadlineDate: body.deadlineDate,
    isActive: isActiveCheckBox,
  };
};
module.exports = {
  index: (req, res, next) => {
    Job.find()
      .then((jobs) => {
        res.locals.jobs = jobs;
        next();
      })
      .catch((error) => {
        console.log(`Error fetching jobs: ${error.message}`);
        next(error);
      });
  },
  indexView: (req, res) => {
    res.render("jobs/index");
  },
  new: (req, res) => {
    res.render("jobs/new");
  },
  create: (req, res, next) => {
    if (req.skip) next();
    let newJob = new Job(getJobParams(req.body));
    newJob.save().then((job) => {
      if (job) {
        req.flash(
          "success",
          `${job.title} created successfully!`
        );
        res.locals.redirect = "/jobs";
        next();
      } else {
        req.flash(
          "error",
          `Failed to create job account because:${error.message}.`
        );
        res.locals.redirect = "/jobs/new";
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
    let jobId = req.params.id;
    Job.findById(jobId)
      .then((job) => {
        res.locals.job = job;
        next();
      })
      .catch((error) => {
        console.log(`Error fetching job by ID: ${error.message}`);
        next(error);
      });
  },
  showView: (req, res) => {
    res.render("jobs/show");
  },
  edit: (req, res, next) => {
    let jobId = req.params.id;
    Job.findById(jobId)
      .then((job) => {
        res.render("jobs/edit", {
          job: job,
        });
      })
      .catch((error) => {
        console.log(`Error fetching job by ID: ${error.message}`);
        next(error);
      });
  },
  update: (req, res, next) => {
    let jobId = req.params.id,
      jobParams = getJobParams(req.body);
    Job.findByIdAndUpdate(jobId, {
      $set: jobParams,
    })
      .then((job) => {
        res.locals.redirect = `/jobs/${jobId}`;
        res.locals.job = job;
        next();
      })
      .catch((error) => {
        console.log(`Error updating job by ID: ${error.message}`);
        next(error);
      });
  },
  delete: (req, res, next) => {
    let jobId = req.params.id;
    Job.findByIdAndDelete(jobId)
      .then(() => {
        res.locals.redirect = "/jobs";
        next();
      })
      .catch((error) => {
        console.log(`Error deleting job by ID: ${error.message}`);
        next();
      });
  },
  validate: (req, res, next) => {
    req.check("title", "Title is invalid").notEmpty();
    req.check("company", "Company is invalid").notEmpty();
    req.check("location", "Location is invalid").notEmpty();
    req.check("description", "Description is invalid").notEmpty();
    req.check("requirements", "Requirements is invalid").notEmpty();
    req.check("salary", "Salary is invalid").notEmpty().isInt();
    req
      .sanitizeBody("contactEmail")
      .normalizeEmail({
        all_lowercase: true,
      })
      .trim();
    req.check("contactEmail", "Contact Email is invalid").isEmail();
    req.check("contactPhone", "Contact Phone is invalid").notEmpty();
    req.check("deadlineDate", "Deadline Date is invalid").notEmpty();
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
};
