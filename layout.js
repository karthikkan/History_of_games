//display all timeline items
var timelineRange = [1930, 2020];
var timelineItems = [1950, 1970, 1975, 1980, 1990, 2000];

for (var i = 0; i < timelineItems.length; i++) {
  var offsetX = window.innerWidth * (timelineItems[i] - timelineRange[0]) / (timelineRange[1] - timelineRange[0]);
  var offsetY = document.getElementById("line").offsetTop-12;

  //create div
  var node = document.createElement("div");
  node.className = "timeline-item";
  node.style.position = "absolute";
  node.style.left = `${Math.round(offsetX)}px`;
  node.style.top = `${offsetY}px`;
  //circle button
  var btn = document.createElement("span");
  btn.className = "timeline-button";
  btn.id = i;
  btn.addEventListener("click", (e)=>{
    page(e.target.id);
  });
  node.appendChild(btn);
  //date text
  var date = document.createElement("p");
  date.innerText = timelineItems[i];
  date.style.margin = "5px";
  node.appendChild(date)
  //add the timeline item
  document.getElementById("timeline").appendChild(node);
}

//switch pages
function page(n) {
  //hide intro
  document.getElementById("intro").style.display = "none";
  //hide current page then show the new page
  var pages = document.getElementsByClassName("page");
  for (var i = 0; i < pages.length; i++) {
    pages[i].style.display = "none";
    if (i == n) pages[i].style.display = "inline";
    //start specific scripts
    if (n == 0) startSpacewar();
    if (n == 1) startPong();
    if (n == 2) startInvaders();
    if (n == 3) startMario();
  }
}