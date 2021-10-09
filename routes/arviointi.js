var express = require('express');
var router = express.Router();
var dbConn  = require('../lib/db');
 
// display grade page
router.get('/', function(req, res, next) {
      
    dbConn.query('SELECT idArviointi,Etunimi,Sukunimi,Osoite,Luokkatunnus,Nimi,Koodi,DATE_FORMAT(paivamaara,"%d.%m.%Y") AS Paivamaara,Arvosana FROM opiskelija o LEFT OUTER JOIN arviointi a ON o.idopiskelija=a.idopiskelija JOIN opintojakso j ON a.idOpintojakso=j.idOpintojakso ORDER by paivamaara DESC;',function(err,rows)
	{
        if(err) {
            req.flash('error', err);
            // render to views/arviointi/index.ejs
            res.render('arviointi',{data:''});   
        } else {
            // render to views/arviointi/index.ejs
            res.render('arviointi',{data:rows});
        }
    });
});

// display add grade page
router.get('/add', function(req, res, next) {    
    // render to add.ejs
    res.render('arviointi/add', {
        Etunimi: '',
        Sukunimi: '',
        Kurssikoodi: '',
        Arvosana: ''        
    })
})

// add a new grade
router.post('/add', function(req, res, next) {    

    let Etunimi = req.body.Etunimi;
    let Sukunimi = req.body.Sukunimi;
    let Koodi = req.body.Kurssikoodi;
    let Arvosana = req.body.Arvosana;
    let errors = false;

    if(Etunimi.length === 0 || Sukunimi.length === 0 || Koodi.length === 0 || Arvosana === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Lisää puuttuvat arviointi tiedot");
        // render to add.ejs with flash message
        res.render('arviointi/add', {
            Etunimi: Etunimi,
            Sukunimi: Sukunimi,
            Koodi: Koodi,
            Arvosana: Arvosana
        })
    }

    // if no error
    if(!errors) {

        var form_data = {
            Etunimi: Etunimi,
            Sukunimi: Sukunimi,
            Koodi: Koodi,
            Arvosana: Arvosana
        }
        
        // insert query
        dbConn.query('CALL lisaa_opintosuoritus(?)', form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                 
                // render to add.ejs
                res.render('arviointi/add', {
                    Etunimi: form_data.Etunimi,
                    Sukunimi: form_data.Sukunimi,
                    Kurssikoodi: form_data.Koodi,
                    Arvosana: form_data.Arvosana                    
                })
            } else {                
                req.flash('success', 'Arviointi lisätty onnistuneesti');
                res.redirect('/arviointi');
            }
        })
    }
})

// display edit grade page
router.get('/edit/(:id)', function(req, res, next) {

    let id = req.params.id;
   
    dbConn.query('SELECT idArviointi,DATE_FORMAT(Paivamaara,"%Y-%m-%d") AS Paivamaara,Arvosana FROM arviointi WHERE idArviointi = ' + id, function(err, rows, fields) {
        if(err) throw err
         
        // if user not found
        if (rows.length <= 0) {
            req.flash('error', 'Arviointia ei löytynyt! id = ' + id)
            res.redirect('/opiskelijat')
        }
        // if grade found
        else {
            // render to edit.ejs
            res.render('arviointi/edit', {
                title: 'Muokkaa arviointia', 
                id: rows[0].idArviointi,
                Paivamaara: rows[0].Paivamaara,
                Arvosana: rows[0].Arvosana,
            })
        }
    })
})

// update grade data
router.post('/update/:id', function(req, res, next) {

    let id = req.params.id;
    let Paivamaara = req.body.Paivamaara;
    let Arvosana = req.body.Arvosana;
    let errors = false;
	
    if(Paivamaara.length === 0 || Arvosana.length === 0) {
        errors = true;
        
        // set flash message
        req.flash('error', "Syötä kelvolliset arviointi tiedot");
        // render to add.ejs with flash message
        res.render('arviointi/edit', {
            id: req.params.id,
            Paivamaara: Paivamaara,
            Arvosana: Arvosana
        })
    }

    // if no error
    if( !errors ) {   
 
        var form_data = {
            Paivamaara: Paivamaara,
            Arvosana: Arvosana
        }
        // update query
        dbConn.query('UPDATE arviointi SET ? WHERE idArviointi = ' + id, form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                // render to edit.ejs
                res.render('arviointi/edit', {
                    id: req.params.id,
                    Paivamaara: form_data.Paivamaara,
                    Arvosana: form_data.Arvosana
                })
            } else {
                req.flash('success', 'Arviointi päivitetty onnistuneesti');
                res.redirect('/arviointi');
            }
        })
    }
})
   
// delete grade
router.get('/delete/(:id)', function(req, res, next) {

    let id = req.params.id;
     
    dbConn.query('DELETE FROM arviointi WHERE idArviointi = ' + id, function(err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
            // redirect to students page
            res.redirect('/arviointi')
        } else {
            // set flash message
            req.flash('success', 'Arviointi poistettu onnistuneesti! ID = ' + id)
            // redirect to students page
            res.redirect('/arviointi')
        }
    })
})

module.exports = router;