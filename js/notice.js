$(document).ready(function () {
    function renderNotice(lang) {
        SiteLang.apply(LANG_DATA.notice, ".notice-page [data-key]", lang);
    }

    renderNotice(SiteLang.getLang());

    $(document).on("languageChanged", function (event, lang) {
        renderNotice(lang);
    });
});