const CONTACT_TEMPLATE = {
    ko: `1. 방송 닉네임 / 데뷔 플랫폼

2. 신청 내용 / 작업 타입 / 개인세 or 기업세
(ex. 일러스트 여캐 전신 / 프리미엄 / 개인세)

3. 캐릭터 외관 설정
(원하시는 디자인을 자세하게 설명해주세요.
나이, 헤어, 눈매, 눈색, 의상, 소품, 표정, 체형, 필수 악세사리, 필수 색상 등
이미지 자료를 포함해 작성해주시면 작업에 큰 도움이 됩니다.)

4. 추가 옵션
(ex. 표정 추가, 손 포즈 추가, 헤어 및 의상 추가, 삼면도 등)

5. 리깅 작가 여부
(있을 시 작가님의 닉네임 기입, 없을 시 공란으로 비워주세요.)

6. 저작권 구매 여부 / 비공개 여부

7. 요청사항
(추가 요청 사항이 있을 시 기입해주세요.)

8. 컨펌을 위한 연락수단 (디스코드, 이메일)`,

    en: `1. 방송 닉네임 / 데뷔 플랫폼 (Streamer Name / Debut Platform) : 

2. 신청 내용 / 작업 타입 / 개인세 혹은 기업세 (Request Details / Work Type / Individual or Corporate) : 
(ex. Full-body Female Illustration / Premium / Independent)

3. 캐릭터 외관 설정 (Character Design & References) :
(Please describe the design in detail: Age, hair, eyes/color, outfit, props, expression, body type, essential accessories, etc. Reference images are highly recommended.)

4. 추가 옵션 (Additional Options) :
(ex. Extra expressions, hand poses, outfits, hairstyles, character sheet/three-view drawing)

5. 리깅 작가 여부 (Rigging Artist Information) : 
(If you have a rigging artist, please provide their name. If not, leave blank.)

6. 저작권 구매 여부 / 비공개 여부 (Copyright Purchase / Privacy Settings) : 

7. 요청사항 (Special Requests) : 
(Any other specific details or requests.)

8. 컨펌을 위한 연락수단 (디스코드, 이메일) (Contact for Feedback: Discord, Email, etc.) : `
};

const CONTACT_EMAIL = "csay0108@naver.com";

const CONTACT_TEXT = {
    ko: {
        copyTemplateDone: "신청 양식이 복사되었습니다.",
        copyEmailDone: "메일주소가 복사되었습니다.",
        copyFail: "복사에 실패했습니다. 직접 복사해주세요.",
        noSlots: "현재 안내 가능한 예약 슬롯이 없습니다.",
        loadFail: "스케줄 데이터를 불러오지 못했습니다.",
        available: "예약 가능",
        closing: "마감 임박",
        upcoming: "오픈 예정",
        closed: "전체 마감"
    },
    en: {
        copyTemplateDone: "Application template copied.",
        copyEmailDone: "Email address copied.",
        copyFail: "Copy failed. Please copy it manually.",
        noSlots: "There are currently no available schedule slots.",
        loadFail: "Failed to load schedule data.",
        available: "Open",
        closing: "Limited",
        upcoming: "Coming Soon",
        closed: "Closed"
    }
};

document.addEventListener("DOMContentLoaded", function () {
    const copyTemplateBtn = document.getElementById("copyTemplateBtn");
    const copyEmailBtn = document.getElementById("copyEmailBtn");

    renderTemplate();

    if (copyTemplateBtn) {
        copyTemplateBtn.addEventListener("click", function () {
            const lang = getCurrentLang();
            copyToClipboard(CONTACT_TEMPLATE[lang] || CONTACT_TEMPLATE.ko, t("copyTemplateDone"));
        });
    }

    if (copyEmailBtn) {
        copyEmailBtn.addEventListener("click", function () {
            copyToClipboard(CONTACT_EMAIL, t("copyEmailDone"));
        });
    }

    renderLinkedScheduleInfo();
});

$(document).on("languageChanged", function () {
    renderTemplate();
    renderLinkedScheduleInfo();
});

function getCurrentLang() {
    return localStorage.getItem("lang") || "ko";
}

function t(key) {
    const lang = getCurrentLang();
    return (CONTACT_TEXT[lang] && CONTACT_TEXT[lang][key]) || CONTACT_TEXT.ko[key] || "";
}

function renderTemplate() {
    const templatePreview = document.getElementById("templatePreview");
    if (!templatePreview) return;

    const lang = getCurrentLang();
    templatePreview.textContent = CONTACT_TEMPLATE[lang] || CONTACT_TEMPLATE.ko;
}

function renderLinkedScheduleInfo() {
    const target = document.getElementById("linkedScheduleInfo");

    if (!target) return;

    if (typeof window.getScheduleFormOptions !== "function") {
        target.innerHTML = `<p class="linked-schedule-empty">${t("loadFail")}</p>`;
        return;
    }

    const items = window.getScheduleFormOptions();

    const visibleItems = items.filter(function (item) {
        return item.status === "available"
            || item.status === "closing"
            || item.status === "upcoming"
            || item.status === "closed";
    });

    if (!visibleItems.length) {
        target.innerHTML = `<p class="linked-schedule-empty">${t("noSlots")}</p>`;
        return;
    }

    target.innerHTML = visibleItems.map(function (item) {
        return `
            <div class="linked-schedule-chip ${item.status}">
                <strong>${getMonthLabel(item.month)}</strong>
                <span>${getStatusText(item.status)}</span>
                ${getSlotDiamonds(item)}
            </div>
        `;
    }).join("");
}

function getMonthLabel(month) {
    const lang = getCurrentLang();

    if (lang === "en") {
        const MONTHS = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        return MONTHS[Number(month) - 1] || String(month);
    }

    return `${month}월`;
}

function getStatusText(status) {
    if (status === "available") return t("available");
    if (status === "closing") return t("closing");
    if (status === "upcoming") return t("upcoming");
    return t("closed");
}

function getSlotDiamonds(item) {
    if (item.status === "upcoming" || item.status === "closed") {
        return "";
    }

    let html = "";

    if (item.regular) {
        html += createDiamondGroup(item.regular, "regular");
    }

    if (item.event) {
        html += createDiamondGroup(item.event, "event");
    }

    if (item.collab) {
        html += createDiamondGroup(item.collab, "collab");
    }

    return `<div class="slot-diamonds">${html}</div>`;
}

function createDiamondGroup(data, type) {
    const total = Number(data.total || 0);
    const booked = Number(data.booked || 0);

    let diamonds = "";

    for (let i = 0; i < total; i++) {
        if (i < booked) {
            diamonds += `<span class="slot-diamond filled ${type}"></span>`;
        } else {
            diamonds += `<span class="slot-diamond empty ${type}"></span>`;
        }
    }

    return diamonds;
}

function copyToClipboard(text, message) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(function () {
                showCopyMessage(message);
            })
            .catch(function () {
                fallbackCopy(text, message);
            });
        return;
    }

    fallbackCopy(text, message);
}

function fallbackCopy(text, message) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();

    try {
        document.execCommand("copy");
        showCopyMessage(message);
    } catch (error) {
        showCopyMessage(t("copyFail"));
    }

    document.body.removeChild(textarea);
}

function showCopyMessage(message) {
    const messageEl = document.getElementById("copyMessage");
    if (!messageEl) return;

    messageEl.textContent = message;

    clearTimeout(showCopyMessage._timer);
    showCopyMessage._timer = setTimeout(function () {
        messageEl.textContent = "";
    }, 2200);
}