/*
* pawn : obj { x : , y: }, x and y must be int
* round : turn : int
* board : array[19][19] : 0 to 18
* start : timestamp --> new Date().getTime() --> milisecondes
*/
function check(pawn, round, board, start ) {
  // time when we receve the answer
  let currentTime = new Date().getTime();

  let result = true;

  // Get X and Y
  let x = pawn.x;
  let y = pawn.y;

  // check if x is an integer
  result &= isInt(x);

  // check if y is an integer
  result &= isInt(y);

  // check if x is on the board
  result &= ( x > -1 || x < 20 );

  // check if y is on the board
  result &= ( y > -1 || y < 20 );

  // check if the board's square 
  // try catch because if x or y is not an integer an excpetion is throw
  try {
    result &= ( board[x][y] == 0 );
  } catch(Exception) {
    result &= false;
  }

  // check if time is respected
  isTimeout = false;
  if ( ( currentTime - start ) > 10*1000 )   {
    isTimeout = true
    result &= false;
  }

  // check for the round 2 if the case is into the 8 squares allowed
  if ( round == 2 ) {
    //si 2eme requete --> 3 ou plus intersection
    result &= ( x < 8 || x > 10 ) && ( y < 8 || y > 10 );
  }

  return { result : result, isTimeout: isTimeout };
}

/*
* return true if the param is en integer 
*/
function isInt(value) {
  return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}