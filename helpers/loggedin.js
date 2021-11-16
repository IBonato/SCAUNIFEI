// Check if user is authenticaded
module.exports = {
    loggedin: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        req.session.returnTo = req.originalUrl
        req.flash("error_msg", "Você precisa estar logado para acessar essa página!")
        res.redirect("/")
    },
    docente: (req, res, next) => {
        if (req.isAuthenticated()) {
            if (req.user.docente === true || req.user.isAdmin === true)
                return next();
        }
        req.session.returnTo = req.originalUrl
        req.flash("error_msg", "Você precisa ser um docente para acessar essa função!")
        res.redirect("back")
    },
    isAdmin: (req, res, next) => {
        if (req.isAuthenticated()) {
            if (req.user.isAdmin === true)
                return next();
        }
        req.session.returnTo = req.originalUrl
        req.flash("error_msg", "Você precisa ser um administrador para acessar essa página!")
        res.redirect("/")
    }
}