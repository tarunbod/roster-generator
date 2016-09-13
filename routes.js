var router = require('express').Router();
var config = require('./config');

router.get('/manage_employees', function(req, res) {
    config.data.allEmployees(function(err, rows) {
        if (err) {
            res.render('error', {
                error: err
            });
        } else {
            res.render('manage_employees', {
                rows: rows
            });
        }
    });
});

router.get('/add_employee', function(req, res) {
    res.render('add_employee');
});

router.post('/add_employee', function(req, res) {
    config.data.addEmployee(req.body, function(err) {
        if (err) {
            res.render('error', {
                message: 'error adding employee',
                error: err
            });
        } else {
            res.redirect('/manage_employees');
        }
    });
});

router.get('/edit_employee', function(req, res) {
    var id = req.query.id;
    if (id) {
        config.data.getEmployee(id, function(err, employee) {
            if (err) {
                res.status(500).render('error', {
                    message: 'Error retreiving employee from database',
                    error: {
                        status: 500,
                        stack: err.stack
                    }
                });
            } else {
                res.render('edit_employee', {
                    employee: employee
                });
            }
        });
    } else {
        res.status(500).render('error', {
            message: 'Id param is null/undefined',
            error: {
                status: 500,
                stack: 'lol'
            }
        });
    }
});

router.post('/edit_employee', function(req, res) {
    config.data.updateEmployee(req.body, function(err) {
        if (err) {
            res.render('error', {
                message: 'error updating employee data',
                error: err
            });
        } else {
            res.redirect('/manage_employees');
        }
    });
});

router.get('/delete_employee', function(req, res) {
    var id = req.query.id;
    if (id) {
        config.data.getEmployee(id, function(err, employee) {
            // this will never happen probably
            if (err) {
                res.status(500).render('error', {
                    message: 'Error retreiving employee from database',
                    error: {
                        status: 500,
                        stack: err.stack
                    }
                })
            } else {
                res.render('delete_employee', {
                    employee: employee
                });
            }
        });
    } else {
        res.status(500).render('error', {
            message: 'Id param is null/undefined',
            error: {
                status: 500,
                stack: 'lol'
            }
        });
    }
});

router.post('/delete_employee', function(req, res) {
    config.data.deleteEmployee(req.body.id, function() {
        res.redirect('/manage_employees');
    });
});

router.get('/create_roster', function(req, res) {
    res.render('create_roster');
});

router.get('/roster_data', function(req, res) {
    config.data.getEmployeesByDayAndShift(req.query.day, req.query.shift, (err, rows) => {
        res.end(JSON.stringify(rows));
    });
});

router.get('/stop', function(req, res) {
    res.end('sucessfully stopped');
    process.exit(0);
});

module.exports = router;
