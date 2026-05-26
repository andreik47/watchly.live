
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.movie-detail__tab, .menu-tab');
  const panels = document.querySelectorAll('.movie-detail__panel, .tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      if (!targetId) return;

      tabs.forEach(t => {
        t.classList.remove('active', 'movie-detail__tab--active');
      });
      panels.forEach(panel => {
        panel.classList.remove('active', 'movie-detail__panel--active');
      });

      tab.classList.add('active', 'movie-detail__tab--active');
      const activePanel = document.getElementById(targetId);
      if (activePanel) {
        activePanel.classList.add('active', 'movie-detail__panel--active');
      }
    });
  });
});