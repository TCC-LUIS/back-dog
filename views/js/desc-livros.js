$('#livro1').on("click", function(e) {
    $(".popup-livro").css("visibility", "visible")
    $(".popup-livro").css("transform", "translate(40%, 5%)")
    $(".popup-livro").css("scale", "1")
    $("#main").css("filter", "blur(3px)")
    $("#header").css("filter", "blur(3px)")
})

$('.fechar-popup').on("click", function(e) {
    $(".popup-livro").css("visibility", "hidden")
    $(".popup-livro").css("scale", "0.3")
    $(".popup-livro").css("transform", "translate(130%, -300%)")
    $("#main").css("filter", "blur(0px)")
    $("#header").css("filter", "blur(0px)")
})
