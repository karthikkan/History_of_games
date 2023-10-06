//handle keypresses
var keys = {};//should be a global var, you can use in any of your game files -Arky
function addKey(e) {
  if(e) {
    keys[e.code] = true;
  }
}
function removeKey(e) {
  if(e) {
    //search and delete key from keys 
    keys[e.code] = false;
  }
}