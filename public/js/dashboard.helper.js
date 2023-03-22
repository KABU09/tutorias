const navigateToSumary = (tutoriaId) => {
    location.href = `/tutoria/resumen?tutoriaId=${tutoriaId}`;
}

function changeTab(aTagClicked) {
    const id = aTagClicked.id;
    const tabAcceptedContent = document.querySelector('#tabAcceptedContent');
    const tabPendingContent = document.querySelector('#tabPendingContent');
    const tabDeniedContent = document.querySelector('#tabDeniedContent');
    const tabFinalizedContent = document.querySelector('#tabFinalizedContent');

    resetActive();
    if (id === 'tabAccepted') {
        tabAcceptedContent.classList.remove('d-none');
        tabPendingContent.classList.add('d-none');
        tabDeniedContent.classList.add('d-none');
        tabFinalizedContent.classList.add('d-none');
    }
    if (id === 'tabPending') {
        tabAcceptedContent.classList.add('d-none');
        tabPendingContent.classList.remove('d-none');
        tabDeniedContent.classList.add('d-none');
        tabFinalizedContent.classList.add('d-none');
    }
    if (id === 'tabDenied') {
        tabAcceptedContent.classList.add('d-none');
        tabPendingContent.classList.add('d-none');
        tabDeniedContent.classList.remove('d-none');
        tabFinalizedContent.classList.add('d-none');
    }
    if (id === 'tabFinalized') {
        tabAcceptedContent.classList.add('d-none');
        tabPendingContent.classList.add('d-none');
        tabDeniedContent.classList.add('d-none');
        tabFinalizedContent.classList.remove('d-none');
    }
    aTagClicked.classList.add('active');

}
const resetActive = () => {
    const aLinks = document.querySelectorAll('.nav-link');
    aLinks.forEach(aLink => {
        aLink.classList.remove('active');
    })
}