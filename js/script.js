var fs = require('fs');
var sql = require(__dirname+'/sql.js');





var sqlite = function(){
  var filename,db;
  this.load = function(file){
    filename = file;
    db = new SQL.Database(fs.readFileSync(filename));

/*
    db.run('CREATE TABLE "logs" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,'+
    ' "col1" varchar NOT NULL,'+
     '"col2" varchar NOT NULL,'+
 '"col3" text,'+
 '"col4" integer DEFAULT 0,' +
' "col5" varchar,' +
' "created_at" datetime NOT NULL,' +
' "updated_at" datetime NOT NULL)');

for(var i=0;i<30000;i++){
  db.run('insert into logs (col1,col2,col3,col4,col5,created_at,updated_at) values'+
  ' ("ああああああああああああああああああああああああああああああああ'+i+
  '","いいいいいいいいいいいいいいいいいいいいいいいいいい'+i+
  '","うううううううううううううううううううううううううううううううう'+i+'",'+i+
  ',"えええええええええええええええええええええ","'+Date.now().toLocaleString()+'","'+Date.now().toLocaleString()+'");');

}

fs.writeFileSync(filename, new Buffer(db.export()));
*/

  }
  this.tables = function() {
    var ret =[];
    db.each("SELECT tbl_name FROM sqlite_master WHERE type='table'",function(rec){
      ret.push(rec.tbl_name);
    });
    return ret;
  }
  this.ddl = function (tbl_name) {
    var ret ="";
    db.each("SELECT sql FROM sqlite_master WHERE tbl_name= :name",{":name":tbl_name},function(rec){
      ret+=rec.sql+"\n";
    });
    return ret;
  }
  this.columns = function (tbl_name) {
    var ret =[];
    db.each("PRAGMA table_info("+tbl_name+")",function(rec){
      ret.push(rec);
    });
    return ret;
  }
  this.select_all = function (tbl_name) {
    var ret =[];
    db.each("SELECT rowid as row_id,* from "+tbl_name,function(rec){
      for(var col in rec){
        if(rec[col] && rec[col].length > 15000 ){
          rec[col] = rec[col].slice(0,15000);
        }
      }
      ret.push(rec);
    });
    return ret;
  },
  this.edit = function (obj) {
    var ret ={error:false,msg:""};
    try{
      db.run("UPDATE "+obj.table_name+" SET "+obj.column_name+"=:val WHERE rowid=:rowid",
             {':val':obj.value, ':rowid': obj.rowid});
      fs.writeFileSync(filename, new Buffer(db.export()));
    }catch(err){
      ret.error = true;
      ret.msg = err.message;
    }
    return ret;
  }
};

module.exports = new sqlite();
