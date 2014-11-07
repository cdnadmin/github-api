var express = require ('express');
var router = express.Router(); 
var ghapi = require('github-api');


var app = express();


/****************************************************************************
 Get USER
*****************************************************************************/
router.get('/user', function(req, res){
  //todo: streamline, code structure is not production worthy yet.
  if (!req.query.q){
    res.json(
      {
        hasError: true,
        message:"Query string token, 'q', not supplied!", 
        error:{}
      });
    return;
  }  

  var userData = null;

   req.db.close();//todo: part of db streamlining. this is not production worthy, same for opening below...

  //first order of business, check if user is cached in datastore
   req.db.open(function(err, theDb){
      if (err) {
      res.json(
        {
          hasError: true,
          message: err.message, 
          error: err
        });
      return;
    }
       theDb.collection('ghUsers', function(err, theCollection){
         if (err) {
          res.json(
            {
              hasError: true,
              message: err.message, 
              error: err
            });
          return;
          }

        theCollection.find({login:req.query.q}).toArray(function(err, theDocs){//req.query.q is the user to find
             if (err) {
              res.json(
                {
                  hasError: true,
                  message: err.message, 
                  error: err
                });
              return;
              }

             userData = theDocs[0];//todo: streamline this

            /* .created property is our own, not from GitHub */
            if (userData){
              if (((Date.now() - userData.created) /1000/60/60 ) <= 1.00){//if data is not stale (> 1 hour)
                res.json(userData);
                return;
              }
              else{//if existing record is older than one hour, delete it, will be inserted from GitHub below.
                theCollection.remove({login:req.query.q});
              }

            }

            //get to this point if user is not already in datastore
            try{
              var github = new ghapi({
                token:"c44058d0f680da482425b17b8ba691d44f397f03", //monicotodo: grab this from config file
                auth:"oauth"
                });
              }
            catch(err){//todo: why are we not getting here when token is invalid?
                res.json(
                  {
                    hasError: true,
                    message: err.message, 
                    error:{}
                  });
                return;
              }
            github.getUser().show(req.query.q /* req.query.q is the user to find */, 
              function(err, user){/* user is the resulting json data from github */
                  if (err){
                    res.json(
                      {
                        hasError: true,
                        message: "User not found!", 
                        error:{}
                      });
                    return;
                  }
                  //cache to data store before json-returning
                  user.created = Date.now();
                  theCollection.insert(user);

                  res.json(user);
                  });//end .show()

        return;
        });//end coll.find().toArray() call
       });//end db.collection() call
   });//end db.open() call

  });//end router.get()


/****************************************************************************
 Get REPOs
*****************************************************************************/
router.get('/repos', function(req, res){
 var data = {};

  if (!req.query.q){
    res.render('error', {message:"Query string token, 'q', not supplied!", error:{}});
    return;
  }

  var github = new ghapi({
    token:"c44058d0f680da482425b17b8ba691d44f397f03", //monicotodo: grab this from config file
    auth:"oauth"
  });

  github.getUser().userRepos(req.query.q /* req.query.q is the user to find repos for */, 
    function(err, repos){/* repos is the resulting array of json objects from github */
        if (err){
          res.render('error', {message:err.message, error:{}});
          return;
        }
        res.json(repos);
        });//end .userRepos()

  return;
  });



module.exports = router;


