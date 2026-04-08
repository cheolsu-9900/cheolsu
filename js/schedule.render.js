function getCurrentLang() {
    return localStorage.getItem("lang") || "ko";
}

function getIndexText(key) {
    const lang = getCurrentLang();
    return (window.LANG_DATA &&
        window.LANG_DATA.index &&
        window.LANG_DATA.index[lang] &&
        window.LANG_DATA.index[lang][key]) || "";
}

function formatMonth(year, month) {
    const lang = getCurrentLang();

    if (lang === "en") {
        const MONTHS = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        return MONTHS[month - 1];
    }

    return `${month}월`;
}

function hasSection(slotData) {
    return slotData && (slotData.status === "upcoming" || Number(slotData.total) > 0);
}

function getSectionLabel(type) {
    const lang = getCurrentLang();

    if (lang === "en") {
        if (type === "event") return "Event";
        if (type === "collab") return "Collab";
        return "Regular";
    }

    if (type === "event") return "이벤트";
    if (type === "collab") return "협업";
    return "일반";
}

function getOverallLabel(statusKey) {
    const lang = getCurrentLang();

    const map = {
        ko: {
            available: "예약 가능",
            closing: "마감 임박",
            closed: "전체 마감",
            upcoming: "오픈 예정"
        },
        en: {
            available: "Open",
            closing: "Limited",
            closed: "Closed",
            upcoming: "Coming Soon"
        }
    };

    return (map[lang] && map[lang][statusKey]) || map.ko[statusKey] || "";
}

function getRemainingText(remaining) {
    const lang = getCurrentLang();

    if (lang === "en") {
        if (remaining <= 0) return "Closed";
        if (remaining === 1) return "1 slot left";
        return `${remaining} slots left`;
    }

    if (remaining <= 0) return "예약 마감";
    if (remaining === 1) return "1 슬롯 남음";
    return `${remaining} 슬롯 남음`;
}

function getCapacityText(total, booked) {
    const lang = getCurrentLang();
    const safeTotal = Math.max(Number(total || 0), 0);
    const safeBooked = Math.max(Number(booked || 0), 0);

    if (lang === "en") {
        return `${safeBooked}/${safeTotal} booked`;
    }

    return `${safeBooked}/${safeTotal} 예약`;
}

function translateMemo(item) {
    const lang = getCurrentLang();
    if (lang === "ko") return item.memo || "";

    const map = {
        "전체 마감": "Fully closed",
        "일반 예약 가능": "Regular available",
        "예약 오픈": "Booking open",
        "오픈 예정": "Coming soon"
    };

    return map[item.memo] || item.memo || "";
}

function getSectionState(slotData, type) {
    if (!slotData) return null;

    if (slotData.status === "upcoming") {
        return {
            type,
            total: Number(slotData.total || 0),
            booked: 0,
            remaining: 0,
            summary: getCurrentLang() === "en" ? "Coming soon" : "오픈 예정",
            statusKey: "upcoming",
            className: "is-upcoming"
        };
    }

    const total = Math.max(Number(slotData.total || 0), 0);
    const booked = Math.max(Number(slotData.booked || 0), 0);
    const remaining = Math.max(total - booked, 0);

    if (remaining <= 0) {
        return {
            type,
            total,
            booked,
            remaining,
            summary: getRemainingText(remaining),
            statusKey: "closed",
            className:
                type === "event"
                    ? "is-event-closed"
                    : type === "collab"
                    ? "is-collab-closed"
                    : "is-closed"
        };
    }

    if (remaining === 1) {
        return {
            type,
            total,
            booked,
            remaining,
            summary: getRemainingText(remaining),
            detail: getCapacityText(total, booked),
            statusKey: "closing",
            className: "is-low"
        };
    }

    return {
        type,
        total,
        booked,
        remaining,
        summary: getRemainingText(remaining),
        detail: getCapacityText(total, booked),
        statusKey: "available",
        className:
            type === "event"
                ? "is-event-open"
                : type === "collab"
                ? "is-collab-open"
                : "is-open"
    };
}

function getCardStatus(states) {
    if (!states.length) return "closed";
    if (states.every((state) => state.statusKey === "upcoming")) return "upcoming";
    if (states.every((state) => state.statusKey === "closed")) return "closed";
    if (states.some((state) => state.statusKey === "available")) return "available";
    if (states.some((state) => state.statusKey === "closing")) return "closing";
    return "closed";
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderDiamondSlots(sectionState, type) {
    if (sectionState.className === "is-upcoming") {
        return "";
    }

    const total = Math.max(Number(sectionState.total || 0), 0);
    const booked = Math.max(Number(sectionState.booked || 0), 0);

    return `
        <div class="slot-diamonds" aria-label="${type} slots">
            ${Array.from({ length: total }).map((_, index) => {
                const isBooked = index < booked;
                const stateClass = isBooked ? "filled" : "empty";
                return `<span class="slot-diamond ${stateClass} ${type}" aria-hidden="true"></span>`;
            }).join("")}
        </div>
    `;
}

function renderSection(sectionState) {
    const hasSlots = sectionState.className !== "is-upcoming";

    return `
        <div class="schedule-item ${sectionState.type}">
            <div class="schedule-item-head">
                <span class="schedule-item-label ${sectionState.type}">
                    ${getSectionLabel(sectionState.type)}
                </span>
               <span class="schedule-item-value ${sectionState.className}">
    ${sectionState.type === "collab" ? "" : escapeHtml(sectionState.summary)}
</span>
            </div>

            ${hasSlots ? `
                <div class="schedule-line-slots">
                    ${renderDiamondSlots(sectionState, sectionState.type)}
                </div>
            ` : ""}


        </div>
    `;
}

function renderMemo(item, cardStatus) {
    const memo = translateMemo(item).trim();

    if (!memo) return "";
    if (
        (cardStatus === "closed" && (memo === "전체 마감" || memo === "Fully closed")) ||
        (cardStatus === "upcoming" && (memo === "오픈 예정" || memo === "Coming soon"))
    ) {
        return "";
    }

    return `<p class="schedule-memo">${escapeHtml(memo)}</p>`;
}

function renderScheduleCard(item) {
    const states = [
        hasSection(item.regular) ? getSectionState(item.regular, "regular") : null,
        hasSection(item.event) ? getSectionState(item.event, "event") : null,
        hasSection(item.collab) ? getSectionState(item.collab, "collab") : null
    ].filter(Boolean);

    const cardStatus = getCardStatus(states);

    return `
        <article class="schedule-card clean-card ${cardStatus === "closed" ? "is-closed-month" : ""} ${cardStatus === "upcoming" ? "is-upcoming-month" : ""}">
            <div class="schedule-card-head">
                <span class="schedule-month">${formatMonth(item.year, item.month)}</span>
                <span class="schedule-card-badge ${cardStatus}">
                    ${escapeHtml(getOverallLabel(cardStatus))}
                </span>
            </div>

            <div class="schedule-items">
                ${states.map(renderSection).join("")}
            </div>

            ${renderMemo(item, cardStatus)}
        </article>
    `;
}

function renderSchedule() {
    const board = document.getElementById("scheduleBoard");
    const titleEl = document.getElementById("scheduleTitle");

    if (!board || typeof SCHEDULE_DATA === "undefined") return;

    const normalizedData = [];
    let currentYear = START_YEAR;
    let prevMonth = 0;

    SCHEDULE_DATA.forEach((item) => {
        const month = Number(item.month);

        if (prevMonth && month < prevMonth) {
            currentYear += 1;
        }

        normalizedData.push({
            ...item,
            year: item.year || currentYear
        });

        prevMonth = month;
    });

    const sortedData = [...normalizedData].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });

    if (titleEl) {
        const currentYear = sortedData[0]?.year || new Date().getFullYear();
        titleEl.textContent = `${currentYear} ${getIndexText("schedule_title")}`;
    }

    board.innerHTML = sortedData.map(renderScheduleCard).join("");
}

function getScheduleFormOptions() {
    if (typeof SCHEDULE_DATA === "undefined") return [];

    const normalizedData = [];
    let currentYear = START_YEAR;
    let prevMonth = 0;

    SCHEDULE_DATA.forEach((item) => {
        const month = Number(item.month);

        if (prevMonth && month < prevMonth) {
            currentYear += 1;
        }

        const year = item.year || currentYear;

        const states = [
            hasSection(item.regular) ? getSectionState(item.regular, "regular") : null,
            hasSection(item.event) ? getSectionState(item.event, "event") : null,
            hasSection(item.collab) ? getSectionState(item.collab, "collab") : null
        ].filter(Boolean);

        const cardStatus = getCardStatus(states);

        normalizedData.push({
            year,
            month,
            status: cardStatus,
            regular: item.regular || null,
            event: item.event || null,
            collab: item.collab || null,
            memo: item.memo || ""
        });

        prevMonth = month;
    });

    return normalizedData.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });
}

window.getScheduleFormOptions = getScheduleFormOptions;

document.addEventListener("DOMContentLoaded", renderSchedule);

$(document).on("languageChanged", function () {
    renderSchedule();
});