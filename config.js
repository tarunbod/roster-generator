var fs = require('fs');
var EventEmitter = require('events');
var sqlite3 = require('sqlite3');

var DB_FILE_NAME = 'data.sqlite3';

var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var SHIFTS = ["Morning", "Noon", "Night"];

fs.closeSync(fs.openSync(DB_FILE_NAME, 'a')); // hacky way to create a file if it doesn't exist

var db = new sqlite3.Database(DB_FILE_NAME);

var data = exports.data = {};

/* Data Functions
------------------*/

data.createEmployeeTable = function() {
    db.run(
        'CREATE TABLE IF NOT EXISTS employees (' +
            'id        INTEGER PRIMARY KEY AUTOINCREMENT,' +
            'name      TEXT,' +
            'days_off  TEXT,' +
            'shifts    TEXT'  +
        ')',
        [],
        function cb(err) {
            if (err) {
                console.error(err);
            } else {
                console.log('Employee table was created.');
            }
        }
    );
};

data.allEmployees = function(cb) {
    db.all('SELECT * FROM employees', [], cb);
};

data.getEmployee = function(id, cb) {
    db.get('SELECT * FROM employees WHERE id = ?', [id], cb);
};

data.getEmployeesByDayAndShift = function(day, shift, cb) {
    // i know this is prone to SQL injection but honestly who's going to use this app
    db.all(
        "SELECT name FROM employees WHERE days_off NOT LIKE '%" + day + "%' AND shifts LIKE '%" + shift + "%'",
        [],
        cb
    );
}

data.addEmployee = function(obj, cb) {
    var days_off = '';
    DAYS.forEach(function(day) {
        if (obj[day]) {
            days_off += day + '|';
        }
    });
    days_off = days_off.substring(0, days_off.length - 1);

    var shifts = '';
    SHIFTS.forEach(function(shift) {
        if (obj[shift]) {
            shifts += shift + '|';
        }
    });
    shifts = shifts.substring(0, shifts.length - 1);

    db.run('INSERT INTO employees (name, days_off, shifts) VALUES ($name, $days_off, $shifts)', {
        $name: obj.name,
        $days_off: days_off,
        $shifts: shifts
    }, cb);
};

data.updateEmployee = function(obj, cb) {
    var days_off = '';
    DAYS.forEach(function(day) {
        if (obj[day]) {
            days_off += day + '|';
        }
    });
    days_off = days_off.substring(0, days_off.length - 1);

    var shifts = '';
    SHIFTS.forEach(function(shift) {
        if (obj[shift]) {
            shifts += shift + '|';
        }
    });
    shifts = shifts.substring(0, shifts.length - 1);

    db.run(
        'UPDATE employees SET name = $name, days_off = $days_off, shifts = $shifts WHERE id = $id',
        {
            $name: obj.name,
            $days_off: days_off,
            $shifts: shifts,
            $id: parseInt(obj.id)
        },
        cb
    );
}

data.deleteEmployee = function(id, cb) {
    db.run('DELETE FROM employees WHERE id = ?', id, cb);
};

// data.getRosterData = function(year, month, cb) {
//
//     var days = Date.getDaysInMonth(year, month - 1);
//     var rosterPeople = {};
//
//     var doneEmitter = new EventEmitter();
//     doneEmitter.on('update', (date, dayName, shift, currentDayRows) => {
//         var obj = {
//             num: date,
//             name: dayName,
//         };
//         obj[shift] = obj[shift] == undefined ? currentDayRows : obj[shift].push(currentDayRows);
//         rosterPeople[date] = obj;
//         if (date == days && shift == "Night") {
//             doneEmitter.emit('done', rosterPeople);
//         }
//     });
//     doneEmitter.on('done', cb);
//
//     var employeeData = [];
//
//     for (var i = 0; i < days; i++) {
//         var date = i + 1;
//         var dayName = DAYS[new Date(year, month - 1, date).getDay()];
//         SHIFTS.forEach((shift) => {
//             data.getEmployeesByDayAndShift(dayName, shift, (err, rows) => {
//                 if (err) {
//                     console.error(err);
//                 } else {
//                     doneEmitter.emit('update', date, dayName, shift, rows);
//                 }
//             });
//         });
//     }
// };

/* Date Functions
------------------*/
Date.getDaysInMonth = function (year, month) {
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

Date.isLeapYear = function (year) {
    return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
};
