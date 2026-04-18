$(document).ready(function () {
    const portfolioData = {
        basic: [
            {
                src: "/cheolsu/img/portfolio/b_type1.png",
                titleKo: "치지직 / 하나린 미르님",
                titleEn: "CHZZK / Hanalin Mir",
                   },
            {
                src: "/cheolsu/img/portfolio/b_type2.png",
                titleKo: "치지직 / 도이루님",
                titleEn: "CHZZK / Doiru",
                   }
        ],
        premium: [
            {
                src: "/cheolsu/img/portfolio/p_type1.png",
                    titleKo: "판매 모델",
    titleEn: "sales model",
    descKo: "",
    descEn: "",
    modalDescKo: "프리미엄 일러스트 + 풀옵션 리깅 + \nSD 일러스트 (리깅완료) + 삼면도 포함\n표정 5종 (홍조,하트눈,반짝눈,눈물,정색)+ \nIOS 기능 (볼빵빵&메롱) + \n 게임기&손 추가 파츠(실시간 트래킹 연동) + \n선글라스 & 겉옷 ON/OFF 포함\n\n250만원\n\n일러스트: 철수\n리깅: 바다님 (작업중) ",
    modalDescEn: "Premium Illustration +\n Full Option Rigging +\nSD Illustration (Rigged) + Turnaround Included\n5 Expressions (Blush, Heart Eyes, Sparkle Eyes, Tears, Cold face) +\niOS Features (Puffy Cheeks & Tongue Out) +\n Game Console & Hand Parts (Real-time tracking linked) Sunglasses & Outerwear ON/OFF\n\nKRW 2,500,000\n\nIllustration: Cheolsu\nRigging: Bada (In Progress)",
    showDesc: true
            },

            {
                src: "/cheolsu/img/portfolio/p_type2.png",
                titleKo: "치지직 / 미나토 히토리님",
                titleEn: "CHZZK / Minato Hitori",
            },
            {
                src: "/cheolsu/img/portfolio/p_type3.png",
                titleKo: "트위치 / 토라치 키요님 ",
                titleEn: "Twitch / Torachi Kiyo",
            },
                        {
                src: "/cheolsu/img/portfolio/p_type4.png",
                titleKo: "트윗캐스팅 / 하즈키님",
                titleEn: "TwitCasting / Hazuki",
            }
        ]
    };

    const portfolioMeta = {
        ko: {
            basic: {
                heading: "베이직 포트폴리오",
                text: "깔끔한 셀식 채색과 가벼운 구성의 작업물입니다.",
                label: "BASIC",
                features: ["깔끔한 셀식 채색", "빠른 작업", "가벼운 구성"]
            },
            premium: {
                heading: "프리미엄 포트폴리오",
                text: "풍부한 디테일과 높은 완성도의 작업물입니다.",
                label: "PREMIUM",
                features: ["디테일한 채색", "고가동 파츠", "높은 완성도"]
            }
        },
        en: {
            basic: {
                heading: "Basic Portfolio",
                text: "Works with clean cel-style coloring and a lighter composition.",
                label: "BASIC",
                features: ["Clean cel shading", "Fast workflow", "Light composition"]
            },
            premium: {
                heading: "Premium Portfolio",
                text: "Works with richer detail and a more polished finish.",
                label: "PREMIUM",
                features: ["Detailed rendering", "High mobility parts", "High-quality finish"]
            }
        }
    };

    let currentType = "basic";
    let currentIndex = 0;

    function getTypeFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const type = params.get("type");

        if (type === "premium") return "premium";
        return "basic";
    }


    function getLang() {
        return SiteLang.getLang();
    }

    function getCurrentItems() {
        return portfolioData[currentType];
    }

    function getDisplayTitle(item, lang) {
        return lang === "en" ? item.titleEn : item.titleKo;
    }

    function getDisplayDesc(item, lang) {
        return lang === "en" ? item.descEn : item.descKo;
    }

    function renderText(lang) {
        SiteLang.apply(LANG_DATA.portfolio, ".portfolio-page [data-key]", lang);
    }

    function renderTabs() {
        $(".type-tab").removeClass("active");
        $(`.type-tab[data-type="${currentType}"]`).addClass("active");
    }

    function renderTypeIntro(lang) {
        const meta = portfolioMeta[lang][currentType];
        $("#portfolioTypeTitle").text(meta.heading);
        $("#portfolioTypeText").text(meta.text);

        const featureHtml = meta.features.map(feature => `<li>${feature}</li>`).join("");
        $("#portfolioFeatureList").html(featureHtml);
    }

    function renderMainCard(lang) {
        const items = getCurrentItems();
        const item = items[0];
        const label = portfolioMeta[lang][currentType].label;

        $("#portfolioMainImage")
            .attr("src", item.src)
            .attr("alt", getDisplayTitle(item, lang));

        $("#portfolioMainLabel")
            .text(label)
            .removeClass("basic premium")
            .addClass(currentType);

        $("#portfolioMainName").text(getDisplayTitle(item, lang));
        $("#portfolioMainDesc").text(getDisplayDesc(item, lang));
    }

    function renderGrid(lang) {
        const items = getCurrentItems();

        const html = items.map((item, index) => {
            const showDesc = item.showDesc === true;

            return `
        <article class="portfolio-item ${showDesc ? "has-desc" : ""}">
            <button type="button" class="portfolio-thumb" data-index="${index}">
                <img src="${item.src}" alt="${getDisplayTitle(item, lang)}">
            </button>
            <div class="portfolio-item-info">
                <h3>${getDisplayTitle(item, lang)}</h3>
                <p>${getDisplayDesc(item, lang)}</p>
            </div>
        </article>
    `;
        }).join("");

        $("#portfolioGrid").html(html);
    }

    function renderPortfolio(lang) {
        renderText(lang);
        renderTabs();
        renderTypeIntro(lang);
        renderMainCard(lang);
        renderGrid(lang);
    }

function updateModal() {
    const lang = getLang();
    const items = getCurrentItems();
    const item = items[currentIndex];
    const label = portfolioMeta[lang][currentType].label;

    $("#modalImage")
        .attr("src", item.src)
        .attr("alt", getDisplayTitle(item, lang));

    $("#modalLabel")
        .text(label)
        .removeClass("basic premium")
        .addClass(currentType);

    $("#modalTitle").text(getDisplayTitle(item, lang));

    let modalDesc = "";
    if (lang === "ko") {
        modalDesc = item.modalDescKo || item.descKo || "";
    } else {
        modalDesc = item.modalDescEn || item.descEn || "";
    }

    if (item.showDesc) {
        $("#modalDesc").text(modalDesc).show();
    } else {
        $("#modalDesc").text("").hide();
    }
}

    function openModal(index) {
        currentIndex = index;
        updateModal();
        $("#portfolioModal").addClass("open").attr("aria-hidden", "false");
        $("body").addClass("modal-open");
    }

    function closeModal() {
        $("#portfolioModal").removeClass("open").attr("aria-hidden", "true");
        $("body").removeClass("modal-open");
    }

    function moveModal(step) {
        const items = getCurrentItems();
        currentIndex = (currentIndex + step + items.length) % items.length;
        updateModal();
    }

    $(document).on("click", ".type-tab", function () {
        currentType = $(this).data("type");
        renderPortfolio(getLang());
    });

    $("#portfolioMainButton").on("click", function () {
        openModal(0);
    });

    $(document).on("click", ".portfolio-thumb", function () {
        openModal(Number($(this).data("index")));
    });

    $("#modalClose, .portfolio-modal__overlay").on("click", function () {
        closeModal();
    });

    $("#modalPrev").on("click", function () {
        moveModal(-1);
    });

    $("#modalNext").on("click", function () {
        moveModal(1);
    });

    $(document).on("keydown", function (e) {
        if (!$("#portfolioModal").hasClass("open")) return;

        if (e.key === "Escape") {
            closeModal();
        } else if (e.key === "ArrowLeft") {
            moveModal(-1);
        } else if (e.key === "ArrowRight") {
            moveModal(1);
        }
    });

    $(document).on("languageChanged", function (event, lang) {
        renderPortfolio(lang);

        if ($("#portfolioModal").hasClass("open")) {
            updateModal();
        }
    });

    currentType = getTypeFromUrl();
    renderPortfolio(getLang());
});

