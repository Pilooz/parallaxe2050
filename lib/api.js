module.exports = function(app, router) {
    app.set('views', 'views/');
    app.set('view engine', 'ejs');
    const success_msg = {message: "Opération réussie !", status: 200};
    //
    // Restarting Activity
    //
    router.get("/api/restart", function(req, res, next){
        console.info("restarting activity from admin page...");
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(success_msg));
    });
    return {

    }
}