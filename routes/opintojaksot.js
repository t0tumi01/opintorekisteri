var express = require('express');
var router = express.Router();
var dbConn  = require('../lib/db');
 
// display courses page
router.get('/', function(req, res, next) {
      
    dbConn.query('SELECT * FROM opintojakso ORDER BY Nimi',function(err,rows)     {
 
        if(err) {
            req.flash('error', err);
            // render to views/opintojaksot/index.ejs
            res.render('opintojaksot',{data:''});   
        } else {
            // render to views/opintojaksot/index.ejs
            res.render('opintojaksot',{data:rows});
        }
    });
});

// display add courses page
router.get('/add', function(req, res, next) {    
    // render to add.ejs
    res.render('opintojaksot/add', {
        Koodi: '',
        Laajuus: '',
        Nimi: ''       
    })
})

// add a new course
router.post('/add', function(req, res, next) {    

    let Koodi = req.body.Koodi;
    let Laajuus = req.body.Laajuus;
    let Nimi = req.body.Nimi;
    let errors = false;

    if(Koodi.length === 0 || Laajuus.length === 0 || Nimi.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Lisää puuttuvat opintojakson tiedot");
        // render to add.ejs with flash message
        res.render('opintojaksot/add', {
            Koodi: Koodi,
            Laajuus: Laajuus,
            Nimi: Nimi
        })
    }

    // if no error
    if(!errors) {

        var form_data = {
            Koodi: Koodi,
            Laajuus: Laajuus,
            Nimi: Nimi
        }
        
        // insert query
        dbConn.query('INSERT INTO opintojakso SET ?', form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                 
                // render to add.ejs
                res.render('opintojaksot/add', {
                    Koodi: form_data.Koodi,
                    Laajuus: form_data.Laajuus,
                    Nimi: form_data.Nimi,                  
                })
            } else {                
                req.flash('success', 'Opintojakso lisätty onnistuneesti');
                res.redirect('/opintojaksot');
            }
        })
    }
})

// display edit course page
router.get('/edit/(:id)', function(req, res, next) {

    let id = req.params.id;
   
    dbConn.query('SELECT * FROM opintojakso WHERE idOpintojakso = ' + id, function(err, rows, fields) {
        if(err) throw err
         
        // if user not found
        if (rows.length <= 0) {
            req.flash('error', 'Opintojaksoa ei löytynyt! id = ' + id)
            res.redirect('/opintojaksot')
        }
        // if course found
        else {
            // render to edit.ejs
            res.render('opintojaksot/edit', {
                title: 'Muokkaa opintojakson tietoja', 
                id: rows[0].idOpintojakso,
                Koodi: rows[0].Koodi,
                Laajuus: rows[0].Laajuus,
                Nimi: rows[0].Nimi
            })
        }
    })
})

// update course data
router.post('/update/:id', function(req, res, next) {

    let id = req.params.id;
    let Koodi = req.body.Koodi;
    let Laajuus = req.body.Laajuus;
    let Nimi = req.body.Nimi;
    let errors = false;
	
    if(Koodi.length === 0 || Laajuus.length === 0 || Nimi.length == 0) {
        errors = true;
        
        // set flash message
        req.flash('error', "Syötä opintojakson tiedot");
        // render to add.ejs with flash message
        res.render('opintojaksot/edit', {
            id: req.params.id,
            Koodi: Koodi,
            Laajuus: Laajuus,
            Nimi: Nimi
        })
    }

    // if no error
    if( !errors ) {   
 
        var form_data = {
            Koodi: Koodi,
            Laajuus: Laajuus,
            Nimi: Nimi
        }
        // update query
        dbConn.query('UPDATE opintojakso SET ? WHERE idOpintojakso = ' + id, form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                // render to edit.ejs
                res.render('opintojaksot/edit', {
                    id: req.params.id,
                    Koodi: form_data.Koodi,
                    Laajuus: form_data.Laajuus,
                    Nimi: form_data.Nimi,   
                })
            } else {
                req.flash('success', 'Opintojakson tiedot päivitetty onnistuneesti');
                res.redirect('/opintojaksot');
            }
        })
    }
})
   
// delete course
router.get('/delete/(:id)', function(req, res, next) {

    let id = req.params.id;
     
    dbConn.query('DELETE FROM opintojakso WHERE idOpintojakso = ' + id, function(err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
            // redirect to students page
            res.redirect('/opintojaksot')
        } else {
            // set flash message
            req.flash('success', 'Opintojakso poistettu onnistuneesti! ID = ' + id)
            // redirect to students page
            res.redirect('/opintojaksot')
        }
    })
})

module.exports = router;