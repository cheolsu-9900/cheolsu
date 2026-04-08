$(document).ready(function () {

    $.easing.easeInOutCubic = function (x, t, b, c, d) {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
};

    const SELECTORS = {
        page: ".price-page",
        sideNav: ".side-nav",
        sideTarget: ".side-target",
        sideDot: ".side-nav-dot",
        topButton: ".side-nav-top",
        header: "header, .site-header"
    };

    const ACTIVE_OFFSET = 120;
    const EXTRA_GAP = 24;
    const BOTTOM_TOLERANCE = 12;

    const SIDE_SCROLL_DURATION = 260;
    const TOP_SCROLL_DURATION = 320;

    let isAutoScrolling = false;
    let lockedTargetSelector = null;
    let activeTargetSelector = null;
    let scrollEndTimer = null;

function getCurrentLang() {
    return localStorage.getItem("lang") || "ko";
}

    function renderPrice(lang) {
        if (
            typeof SiteLang === "undefined" ||
            !SiteLang.apply ||
            typeof LANG_DATA === "undefined" ||
            !LANG_DATA.price
        ) {
            return;
        }

        SiteLang.apply(LANG_DATA.price, `${SELECTORS.page} [data-key]`, lang);
    }

    function getHeaderOffset() {
        const $header = $(SELECTORS.header).first();
        if (!$header.length) return EXTRA_GAP;

        const headerHeight = $header.outerHeight() || 0;
        const cssTop = parseFloat($header.css("top")) || 0;

        return headerHeight + cssTop + EXTRA_GAP;
    }

    function clampScrollTop(value) {
        const maxScrollTop = Math.max(0, $(document).height() - $(window).height());
        return Math.max(0, Math.min(value, maxScrollTop));
    }

    function getSectionScrollTop($target) {
        if (!$target.length) return 0;
        return clampScrollTop($target.offset().top - getHeaderOffset());
    }

    function getDots() {
        return $(SELECTORS.sideDot);
    }

    function getTargets() {
        return $(SELECTORS.sideTarget);
    }

    function applyActiveTarget(targetSelector) {
        if (!targetSelector) return false;
        if (activeTargetSelector === targetSelector) return true;

        const $dots = getDots();
        if (!$dots.length) return false;

        const $targetDot = $dots.filter(function () {
            return $(this).data("target") === targetSelector;
        }).first();

        if (!$targetDot.length) return false;

        $dots.removeClass("active");
        $targetDot.addClass("active");
        activeTargetSelector = targetSelector;

        return true;
    }

    function applyActiveIndex(index) {
        const $dots = getDots();
        if (!$dots.length) return false;

        const safeIndex = Math.max(0, Math.min(index, $dots.length - 1));
        const targetSelector = $dots.eq(safeIndex).data("target");

        return applyActiveTarget(targetSelector);
    }

    function getCurrentActiveTarget() {
        if (activeTargetSelector) return activeTargetSelector;

        const $activeDot = $(`${SELECTORS.sideDot}.active`).first();
        return $activeDot.data("target") || null;
    }

    function findActiveTargetByScroll() {
        const $targets = getTargets();
        const $dots = getDots();

        if (!$targets.length || !$dots.length) return null;

        const scrollTop = $(window).scrollTop();
        const windowHeight = $(window).height();
        const documentHeight = $(document).height();
        const currentLine = scrollTop + getHeaderOffset() + ACTIVE_OFFSET;
        const scrollBottom = scrollTop + windowHeight;

        if (scrollTop <= 10) {
            return $dots.eq(0).data("target");
        }

        if (scrollBottom >= documentHeight - BOTTOM_TOLERANCE) {
            return $dots.eq($dots.length - 1).data("target");
        }

        let matchedTarget = $dots.eq(0).data("target");

        $targets.each(function (index) {
            const currentTop = $(this).offset().top;
            const nextTop =
                index < $targets.length - 1
                    ? $targets.eq(index + 1).offset().top
                    : Number.POSITIVE_INFINITY;

            if (currentLine >= currentTop && currentLine < nextTop) {
                matchedTarget = `#${$(this).attr("id")}`;
                return false;
            }
        });

        return matchedTarget;
    }

    function updateSideNavActive() {
        if (isAutoScrolling) return;
        if (lockedTargetSelector) return;

        const nextTarget = findActiveTargetByScroll();
        if (!nextTarget) return;

        applyActiveTarget(nextTarget);
    }

    
        clearTimeout(scrollEndTimer);
        
function finishAutoScroll() {
        scrollEndTimer = setTimeout(function () {
            isAutoScrolling = false;

            if (lockedTargetSelector) {
                applyActiveTarget(lockedTargetSelector);
            } else {
                updateSideNavActive();
            }

            toggleTopButton();
        }, 30);
    }

   function smoothScrollTo(topValue, duration, targetSelector) {
        // 1. 이미 진행 중인 애니메이션이 있다면 즉시 멈춤
        // $("html, body").stop(true, true).animate(

        isAutoScrolling = true;
        lockedTargetSelector = targetSelector || null;

        if (lockedTargetSelector) {
            applyActiveTarget(lockedTargetSelector);
       
       
        }
        
$("html, body").stop(true, true).animate(
    {
        scrollTop: clampScrollTop(topValue)
    },
    duration,
    "easeInOutCubic",

    function () {
        finishAutoScroll();
    }
);
    }

    function moveToSection(targetSelector) {
        const $target = $(targetSelector);
        if (!$target.length) return;

        applyActiveTarget(targetSelector);
        smoothScrollTo(getSectionScrollTop($target), SIDE_SCROLL_DURATION, targetSelector);
    }

    function moveToTop() {
        const firstTarget = getDots().eq(0).data("target") || null;
        applyActiveTarget(firstTarget);
        smoothScrollTo(0, TOP_SCROLL_DURATION, firstTarget);
    }

    function unlockManualScroll() {
        isAutoScrolling = false;
        lockedTargetSelector = null;
    }

    function buildSideNav(lang) {
        const $sideNav = $(SELECTORS.sideNav);
        const $targets = getTargets();

        if (!$sideNav.length || !$targets.length) return;

        $sideNav.empty();

        $targets.each(function (index) {
            const id = $(this).attr("id");
            const key = $(this).data("side-key");

            if (!id || !key) return;

            let label = key;

            if (
                typeof LANG_DATA !== "undefined" &&
                LANG_DATA.price &&
                LANG_DATA.price[lang] &&
                LANG_DATA.price[lang][key]
            ) {
                label = LANG_DATA.price[lang][key];
            }

            $sideNav.append(`
                <button
                    type="button"
                    class="side-nav-dot${index === 0 ? " active" : ""}"
                    data-target="#${id}"
                    aria-label="${label}"
                    title="${label}"
                >
                    <span class="side-nav-tooltip">${label}</span>
                </button>
            `);
        });

        activeTargetSelector = null;
        applyActiveIndex(0);
    }

    function toggleTopButton() {
        const $topBtn = $(SELECTORS.topButton);
        if (!$topBtn.length) return;

        if ($(window).scrollTop() > 180) {
            $topBtn.addClass("is-visible");
        } else {
            $topBtn.removeClass("is-visible");
        }
    }

    function bindPriceEvents() {
        $(document).off("click.priceNav", SELECTORS.sideDot);
        $(document).off("click.priceTop", SELECTORS.topButton);
        $(document).off("languageChanged.pricePage");
        $(window).off(".pricePage");

        $(document).on("click.priceNav", SELECTORS.sideDot, function (e) {
            e.preventDefault();
            e.stopPropagation();

            const targetSelector = $(this).data("target");
            if (!targetSelector) return;

            moveToSection(targetSelector);
        });

        $(document).on("click.priceTop", SELECTORS.topButton, function (e) {
            e.preventDefault();
            e.stopPropagation();
            moveToTop();
        });

        $(window).on("wheel.pricePage touchstart.pricePage keydown.pricePage", function () {
            unlockManualScroll();
        });

        $(window).on("scroll.pricePage", function () {
            toggleTopButton();

            if (isAutoScrolling) return;

            clearTimeout(scrollEndTimer);
            scrollEndTimer = setTimeout(function () {
                updateSideNavActive();
            }, 16);
        });

        $(window).on("resize.pricePage", function () {
            if (lockedTargetSelector) {
                applyActiveTarget(lockedTargetSelector);
            } else {
                updateSideNavActive();
            }

            toggleTopButton();
        });

        $(document).on("languageChanged.pricePage", function (event, lang) {
            const keepTarget = lockedTargetSelector || getCurrentActiveTarget();

            renderPrice(lang);
            buildSideNav(lang);

            if (keepTarget) {
                applyActiveTarget(keepTarget);
                activeTargetSelector = keepTarget;
            } else {
                updateSideNavActive();
            }
        });
    }

    function initPricePage() {
        const $page = $(SELECTORS.page);
        if (!$page.length) return;

        const lang = getCurrentLang();

        renderPrice(lang);
        buildSideNav(lang);
        bindPriceEvents();
        updateSideNavActive();
        toggleTopButton();
    }

    initPricePage();
});

document.querySelectorAll(".price-card").forEach(card => {
    card.addEventListener("click", () => {
        const type = card.dataset.type;
        location.href = `/cheolsu/portfolio/?type=${type}`;
    });
});

