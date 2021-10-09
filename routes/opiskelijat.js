var express = require('express');
var router = express.Router();
var dbConn  = require('../lib/db');
 
// display students page
router.get('/', function(req, res, next) {
      
    dbConn.query('SELECT * FROM opiskelija ORDER BY Sukunimi,Etunimi',function(err,rows)     {
 
        if(err) {
            req.flash('error', err);
            // render to views/opiskelijat/index.ejs
            res.render('opiskelijat',{data:''});   
        } else {
            // render to views/opiskelijat/index.ejs
            res.render('opiskelijat',{data:rows});
        }
    });
});

// display add students page
router.get('/add', function(req, res, next) {    
    // render to add.ejs
    res.render('opiskelijat/add', {
        Etunimi: '',
        Sukunimi: '',
        Osoite: '',
        Luokkatunnus: ''        
    })
})

// add a new student
router.post('/add', function(req, res, next) {    

    let Etunimi = req.body.Etunimi;
    let Sukunimi = req.body.Sukunimi;
    let Osoite = req.body.Osoite;
    let Luokkatunnus = req.body.Luokkatunnus;
    let errors = false;

    if(Etunimi.length === 0 || Sukunimi.length === 0 || Osoite.length === 0 || Luokkatunnus === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Lisää puuttuvat opiskelijan tiedot");
        // render to add.ejs with flash message
        res.render('opiskelijat/add', {
            Etunimi: Etunimi,
            Sukunimi: Sukunimi,
            Osoite: Osoite,
            Luokkatunnus: Luokkatunnus
        })
    }

    // if no error
    if(!errors) {

        var form_data = {
            Etunimi: Etunimi,
            Sukunimi: Sukunimi,
            Osoite: Osoite,
            Luokkatunnus: Luokkatunnus
        }
        
        // insert query
        dbConn.query('INSERT INTO opiskelija SET ?', form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                 
                // render to add.ejs
                res.render('opiskelijat/add', {
                    Etunimi: form_data.Etunimi,
                    Sukunimi: form_data.Sukunimi,
                    Osoite: form_data.Osoite,
                    Luokkatunnus: form_data.Luokkatunnus                    
                })
            } else {                
                req.flash('success', 'Opiskelija lisätty onnistuneesti');
                res.redirect('/opiskelijat');
            }
        })
    }
})

// display edit student page
router.get('/edit/(:id)', function(req, res, next) {

    let id = req.params.id;
   
    dbConn.query('SELECT * FROM opiskelija WHERE idOpiskelija = ' + id, function(err, rows, fields) {
        if(err) throw err
         
        // if user not found
        if (rows.length <= 0) {
            req.flash('error', 'Opiskelijaa ei löytynyt! id = ' + id)
            res.redirect('/opiskelijat')
        }
        // if student found
        else {
            // render to edit.ejs
            res.render('opiskelijat/edit', {
                title: 'Muokkaa opiskelijan tietoja', 
                id: rows[0].idOpiskelija,
                Etunimi: rows[0].Etunimi,
                Sukunimi: rows[0].Sukunimi,
                Osoite: rows[0].Osoite,
                Luokkatunnus: rows[0].Luokkatunnus
            })
        }
    })
})

// update student data
router.post('/update/:id', function(req, res, next) {

    let id = req.params.id;
    let Etunimi = req.body.Etunimi;
    let Sukunimi = req.body.Sukunimi;
    let Osoite = req.body.Osoite;
    let Luokkatunnus = req.body.Luokkatunnus;
    let errors = false;
	
    if(Etunimi.length === 0 || Sukunimi.length === 0 || Osoite.length == 0 || Luokkatunnus.length == 0) {
        errors = true;
        
        // set flash message
        req.flash('error', "Syötä opiskelijan tiedot");
        // render to add.ejs with flash message
        res.render('opiskelijat/edit', {
            id: req.params.id,
            Etunimi: Etunimi,
            Sukunimi: Sukunimi,
            Osoite: Osoite,
            Luokkatunnus: Luokkatunnus
        })
    }

    // if no error
    if( !errors ) {   
 
        var form_data = {
            Etunimi: Etunimi,
            Sukunimi: Sukunimi,
            Osoite: Osoite,
            Luokkatunnus: Luokkatunnus
        }
        // update query
        dbConn.query('UPDATE opiskelija SET ? WHERE idOpiskelija = ' + id, form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                // render to edit.ejs
                res.render('opiskelijat/edit', {
                    id: req.params.id,
                    Etunimi: form_data.Etunimi,
                    Sukunimi: form_data.Sukunimi,
                    Osoite: form_data.Osoite,
                    Luokkatunnus: form_data.Luokkatunnus  
                })
            } else {
                req.flash('success', 'Opiskelijan tiedot päivitetty onnistuneesti');
                res.redirect('/opiskelijat');
            }
        })
    }
})
   
// delete student
router.get('/delete/(:id)', function(req, res, next) {

    let id = req.params.id;
     
    dbConn.query('DELETE FROM opiskelija WHERE idOpiskelija = ' + id, function(err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
            // redirect to students page
            res.redirect('/opiskelijat')
        } else {
            // set flash message
            req.flash('success', 'Opiskelija poistettu onnistuneesti! ID = ' + id)
            // redirect to students page
            res.redirect('/opiskelijat')
        }
    })
})

module.exports = router;