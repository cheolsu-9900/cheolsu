$(document).ready(function () {

    function normalizePath(path) {
        return path.replace(/\/index\.html$/, "/").replace(/\/+$/, "/");
    }

    function setActiveMenu() {
        const current = normalizePath(window.location.pathname);

        $(".nav li a").removeClass("active");

        $(".nav li a").each(function () {
            const link = $(this).attr("href");
            if (!link) return;

            const normalizedLink = normalizePath(link);

            if (normalizedLink === current) {
                $(this).addClass("active");
            }
        });
    }

    function isMobile() {
        return window.innerWidth <= 1024;
    }

    function openMenu() {
        $(".menu-btn")
            .addClass("active")
            .attr("aria-label", "메뉴 닫기")
            .attr("aria-expanded", "true");

        $(".nav").addClass("active");
        $("body").addClass("menu-open");
    }

    function closeMenu() {
        $(".menu-btn")
            .removeClass("active")
            .attr("aria-label", "메뉴 열기")
            .attr("aria-expanded", "false");

        $(".nav").removeClass("active");
        $("body").removeClass("menu-open");
    }

    function toggleTopButton() {
        if ($(window).scrollTop() > 300) {
            $(".top-btn").addClass("show");
        } else {
            $(".top-btn").removeClass("show");
        }
    }

    $("#ko, #ko2").on("click", function (e) {
        e.preventDefault();
        SiteLang.setLang("ko");
    });

    $("#en, #en2").on("click", function (e) {
        e.preventDefault();
        SiteLang.setLang("en");
    });

    $(".menu-btn").on("click", function () {
        if ($(this).hasClass("active")) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    $(".nav li a").on("click", function () {
        if (isMobile()) closeMenu();
    });

    $(".top-btn").on("click", function () {
        $("html, body").animate({ scrollTop: 0 }, 700);
    });

    $(window).on("scroll", function () {
        toggleTopButton();
    });

    $(window).on("pageshow", function () {
        setActiveMenu();
        toggleTopButton();
        closeMenu();
    });

    // 진짜 초기 실행
    setActiveMenu();
    toggleTopButton();
    closeMenu();
});