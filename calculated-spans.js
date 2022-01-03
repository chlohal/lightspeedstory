Array.from(document.querySelectorAll(".calculated")).forEach(x=>{
    x.textContent = Math.round(eval(x.textContent)*100)/100;
});