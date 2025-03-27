// App data
const appData = {
  user: {
    id: 2,
    username: 'student',
    role: 'student',
    group: 'А-1'
  },
  subjects: [
    {
      id: 1,
      name: 'Математика',
      teacher: 'Иванов И.И.',
      color: '#3B82F6',
      description: 'Высшая математика и математический анализ'
    },
    {
      id: 2,
      name: 'Физика',
      teacher: 'Петров П.П.',
      color: '#10B981',
      description: 'Общая физика и теоретическая механика'
    },
    {
      id: 3,
      name: 'Программирование',
      teacher: 'Сидоров С.С.',
      color: '#F59E0B',
      description: 'Основы программирования и алгоритмов'
    },
    {
      id: 4,
      name: 'Английский язык',
      teacher: 'Смирнова А.А.',
      color: '#8B5CF6',
      description: 'Иностранный язык профессионального общения'
    },
    {
      id: 5,
      name: 'Философия',
      teacher: 'Козлова В.В.',
      color: '#EC4899',
      description: 'Философия и история науки'
    }
  ],
  homeworks: [
    {
      id: 1,
      title: 'Контрольная работа №1',
      description: 'Решить задачи из учебника, стр. 45-46, №1-10',
      subjectId: 1,
      dueDate: '2025-04-10',
      status: 'active',
      createdAt: '2025-03-25'
    },
    {
      id: 2,
      title: 'Лабораторная работа №3',
      description: 'Исследование колебательных процессов',
      subjectId: 2,
      dueDate: '2025-04-05',
      status: 'active',
      createdAt: '2025-03-22'
    },
    {
      id: 3,
      title: 'Проект: Разработка web-приложения',
      description: 'Создать простое веб-приложение с использованием HTML, CSS и JavaScript',
      subjectId: 3,
      dueDate: '2025-04-15',
      status: 'active',
      createdAt: '2025-03-20'
    },
    {
      id: 4,
      title: 'Эссе на тему "Digital Technologies"',
      description: 'Написать эссе объемом 800-1000 слов на английском языке',
      subjectId: 4,
      dueDate: '2025-04-07',
      status: 'completed',
      createdAt: '2025-03-18'
    }
  ],
  announcements: [
    {
      id: 1,
      title: 'Изменение расписания',
      content: 'Уважаемые студенты! С 5 апреля 2025 года вступает в силу новое расписание занятий. Просьба ознакомиться с изменениями в личном кабинете.',
      createdAt: '2025-03-25'
    },
    {
      id: 2,
      title: 'Предстоящая конференция',
      content: 'Приглашаем всех студентов принять участие в ежегодной научной конференции, которая состоится 12 апреля 2025 года. Для участия необходимо подать заявку до 5 апреля.',
      createdAt: '2025-03-23'
    },
    {
      id: 3,
      title: 'Сбор документов для стипендии',
      content: 'Напоминаем, что до 10 апреля необходимо предоставить документы для оформления повышенной стипендии. Список документов можно уточнить в деканате.',
      createdAt: '2025-03-20'
    }
  ],
  materials: [
    {
      id: 1,
      subjectId: 1,
      title: 'Лекция №1: Введение в анализ',
      type: 'document',
      description: 'Конспект лекции по введению в математический анализ',
      url: '#',
      createdAt: '2025-03-15'
    },
    {
      id: 2,
      subjectId: 1,
      title: 'Практические задания',
      type: 'document',
      description: 'Сборник задач для самостоятельного решения',
      url: '#',
      createdAt: '2025-03-16'
    },
    {
      id: 3,
      subjectId: 2,
      title: 'Лекция №2: Динамика',
      type: 'document',
      description: 'Конспект лекции по динамике точки',
      url: '#',
      createdAt: '2025-03-17'
    },
    {
      id: 4,
      subjectId: 3,
      title: 'Основы JavaScript',
      type: 'link',
      description: 'Полезные материалы для изучения JavaScript',
      url: 'https://developer.mozilla.org/ru/docs/Web/JavaScript',
      createdAt: '2025-03-18'
    },
    {
      id: 5,
      subjectId: 3,
      title: 'HTML и CSS примеры',
      type: 'link',
      description: 'Примеры веб-страниц с использованием HTML и CSS',
      url: 'https://www.w3schools.com/html/',
      createdAt: '2025-03-19'
    }
  ]
};

// Utility functions
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('ru-RU', options);
}

function getRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return formatDate(dateString);
}

function getSubjectById(id) {
  return appData.subjects.find(subject => subject.id === id);
}

// DOM manipulation
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('active');
    });
  }
  
  // Set active navigation based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href').split('/').pop();
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
  
  // Initialize page-specific content
  initPageContent();
});

function initPageContent() {
  // Dashboard page
  if (document.getElementById('dashboard-page')) {
    renderAnnouncements();
    renderUpcomingHomework();
  }
  
  // Subjects page
  if (document.getElementById('subjects-page')) {
    renderSubjects();
  }
  
  // Subject detail page
  const subjectDetailPage = document.getElementById('subject-detail-page');
  if (subjectDetailPage) {
    const subjectId = parseInt(new URLSearchParams(window.location.search).get('id'));
    renderSubjectDetail(subjectId);
  }
  
  // Homework page
  if (document.getElementById('homework-page')) {
    renderHomeworks();
  }
}

// Render functions
function renderAnnouncements() {
  const announcementsList = document.getElementById('announcements-list');
  if (!announcementsList) return;
  
  if (appData.announcements.length === 0) {
    announcementsList.innerHTML = '<p class="text-center py-4">Нет объявлений</p>';
    return;
  }
  
  announcementsList.innerHTML = appData.announcements.map(announcement => `
    <div class="announcement-item">
      <div class="announcement-header">
        <h3 class="announcement-title">${announcement.title}</h3>
        <span class="announcement-date">${getRelativeTime(announcement.createdAt)}</span>
      </div>
      <div class="announcement-content">${announcement.content}</div>
    </div>
  `).join('');
}

function renderUpcomingHomework() {
  const upcomingHomeworkList = document.getElementById('upcoming-homework');
  if (!upcomingHomeworkList) return;
  
  const activeHomeworks = appData.homeworks.filter(hw => hw.status === 'active');
  
  if (activeHomeworks.length === 0) {
    upcomingHomeworkList.innerHTML = '<p class="text-center py-4">Нет активных заданий</p>';
    return;
  }
  
  // Sort by due date (closest first)
  activeHomeworks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  upcomingHomeworkList.innerHTML = activeHomeworks.slice(0, 3).map(homework => {
    const subject = getSubjectById(homework.subjectId);
    return `
      <div class="homework-item">
        <div class="homework-content">
          <h3 class="homework-title">${homework.title}</h3>
          <div class="homework-meta">
            <span style="color: ${subject.color}">${subject.name}</span>
            <span>Сдать до: ${formatDate(homework.dueDate)}</span>
          </div>
          <div class="homework-description">${homework.description}</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderSubjects() {
  const subjectsGrid = document.getElementById('subjects-grid');
  if (!subjectsGrid) return;
  
  if (appData.subjects.length === 0) {
    subjectsGrid.innerHTML = '<p class="text-center py-4">Нет предметов</p>';
    return;
  }
  
  subjectsGrid.innerHTML = appData.subjects.map(subject => `
    <div class="subject-card" onclick="window.location.href='subject-detail.html?id=${subject.id}'">
      <div class="subject-color" style="background-color: ${subject.color}">
        <i class="material-icons">menu_book</i>
      </div>
      <h3 class="subject-title">${subject.name}</h3>
      <p>${subject.description}</p>
      <div class="subject-info">
        <i class="material-icons" style="font-size: 16px; margin-right: 4px;">person</i>
        <span>${subject.teacher}</span>
      </div>
    </div>
  `).join('');
}

function renderSubjectDetail(subjectId) {
  const subject = getSubjectById(subjectId);
  if (!subject) {
    window.location.href = 'subjects.html';
    return;
  }
  
  // Set subject info
  document.getElementById('subject-title').textContent = subject.name;
  document.getElementById('subject-teacher').textContent = subject.teacher;
  document.getElementById('subject-color').style.backgroundColor = subject.color;
  
  // Render materials
  const materialsContainer = document.getElementById('subject-materials');
  const subjectMaterials = appData.materials.filter(m => m.subjectId === subjectId);
  
  if (subjectMaterials.length === 0) {
    materialsContainer.innerHTML = '<p class="text-center py-4">Нет материалов</p>';
  } else {
    materialsContainer.innerHTML = subjectMaterials.map(material => `
      <div class="material-item">
        <div class="material-icon">
          <i class="material-icons">${material.type === 'link' ? 'link' : 'description'}</i>
        </div>
        <div class="material-content">
          <h3 class="material-title">
            ${material.type === 'link' 
              ? `<a href="${material.url}" target="_blank">${material.title}</a>`
              : material.title
            }
          </h3>
          <p class="material-description">${material.description}</p>
        </div>
      </div>
    `).join('');
  }
  
  // Render homeworks
  const homeworksContainer = document.getElementById('subject-homeworks');
  const subjectHomeworks = appData.homeworks.filter(hw => hw.subjectId === subjectId);
  
  if (subjectHomeworks.length === 0) {
    homeworksContainer.innerHTML = '<p class="text-center py-4">Нет домашних заданий</p>';
  } else {
    homeworksContainer.innerHTML = subjectHomeworks.map(homework => `
      <div class="homework-item">
        <div class="homework-content">
          <h3 class="homework-title">${homework.title}</h3>
          <div class="homework-meta">
            <span>Сдать до: ${formatDate(homework.dueDate)}</span>
            <span class="badge ${homework.status === 'completed' ? 'badge-success' : 'badge-warning'}">
              ${homework.status === 'completed' ? 'Выполнено' : 'Активно'}
            </span>
          </div>
          <div class="homework-description">${homework.description}</div>
        </div>
        ${homework.status !== 'completed' ? `
        <div class="homework-actions">
          <button class="btn btn-primary btn-sm" onclick="markHomeworkCompleted(${homework.id})">
            Отметить выполненным
          </button>
        </div>
        ` : ''}
      </div>
    `).join('');
  }
}

function renderHomeworks() {
  const homeworksList = document.getElementById('homeworks-list');
  if (!homeworksList) return;
  
  if (appData.homeworks.length === 0) {
    homeworksList.innerHTML = '<p class="text-center py-4">Нет домашних заданий</p>';
    return;
  }
  
  // Sort by due date (closest first)
  const sortedHomeworks = [...appData.homeworks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  homeworksList.innerHTML = sortedHomeworks.map(homework => {
    const subject = getSubjectById(homework.subjectId);
    const dueDate = new Date(homework.dueDate);
    const today = new Date();
    
    let statusClass = 'badge-warning';
    let statusText = 'Активно';
    
    if (homework.status === 'completed') {
      statusClass = 'badge-success';
      statusText = 'Выполнено';
    } else if (dueDate < today) {
      statusClass = 'badge-danger';
      statusText = 'Просрочено';
    }
    
    return `
      <div class="homework-item" style="border-left-color: ${subject.color}">
        <div class="homework-content">
          <h3 class="homework-title">${homework.title}</h3>
          <div class="homework-meta">
            <span style="color: ${subject.color}">${subject.name}</span>
            <span>Сдать до: ${formatDate(homework.dueDate)}</span>
            <span class="badge ${statusClass}">${statusText}</span>
          </div>
          <div class="homework-description">${homework.description}</div>
        </div>
        ${homework.status !== 'completed' ? `
        <div class="homework-actions">
          <button class="btn btn-primary btn-sm" onclick="markHomeworkCompleted(${homework.id})">
            Отметить выполненным
          </button>
        </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Actions
function markHomeworkCompleted(homeworkId) {
  const homework = appData.homeworks.find(hw => hw.id === homeworkId);
  if (homework) {
    homework.status = 'completed';
    
    // Re-render based on current page
    if (document.getElementById('homework-page')) {
      renderHomeworks();
    } else if (document.getElementById('subject-detail-page')) {
      const subjectId = parseInt(new URLSearchParams(window.location.search).get('id'));
      renderSubjectDetail(subjectId);
    } else if (document.getElementById('dashboard-page')) {
      renderUpcomingHomework();
    }
    
    alert('Задание отмечено как выполненное');
  }
}