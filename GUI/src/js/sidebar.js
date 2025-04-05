document.addEventListener('DOMContentLoaded', () => {
    // Highlight current page
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    document.querySelector(`.menu-item[data-page="${currentPage}"]`)?.classList.add('active');
    
    // Add click handlers
    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const targetPage = item.dataset.page;
        if(targetPage === 'home') {
          window.location.href = 'home.html';
        } else {
          window.location.href = `${targetPage}.html`;
        }
      });
    });
  });