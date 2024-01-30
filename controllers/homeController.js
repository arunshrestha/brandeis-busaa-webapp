module.exports = {
  respondHome: (req, res) => {
    res.render("index");
  },
  respondAbout: (req, res) => {
    res.render("about");
  },
  respondContact: (req, res) => {
    res.render("contact");
  },
  chat: (req, res) => {
    res.render("chat");
  },
};