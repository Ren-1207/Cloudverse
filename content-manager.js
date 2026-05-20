// 動態渲染所有內容
async function renderDynamicContent() {
  if (!window.globalContent) return;

  const content = window.globalContent;

  // 渲染 Hero 區塊
  if (content.hero) {
    const heroH1 = document.querySelector('.hero h1');
    const heroP = document.querySelector('.hero p');
    if (heroH1) {
      heroH1.innerHTML = `${content.hero.title || '驅動台灣企業'}<br><span>${content.hero.subtitle || '雲端轉型之旅'}</span>`;
    }
    if (heroP) {
      heroP.textContent = content.hero.description || '';
    }
  }

  // 渲染 Services
  if (content.services && content.services.length > 0) {
    const servicesGrid = document.querySelector('.services-grid');
    if (servicesGrid) {
      servicesGrid.innerHTML = content.services.map((service, index) => `
        <div class="service-card" style="animation-delay: ${index * 0.1}s;">
          <div class="service-icon">${service.icon}</div>
          <h3>${service.title}</h3>
          <p>${service.description}</p>
          <ul class="service-list">
            ${(service.items || []).map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      `).join('');
    }
  }

  // 渲染統計數據
  if (content.stats && content.stats.length > 0) {
    const analysisGrid = document.querySelector('.analysis-grid');
    if (analysisGrid) {
      const statsHTML = content.stats.map((stat, index) => `
        <div class="stat-card" style="animation-delay: ${index * 0.1}s;">
          <div class="stat-number">${stat.number}</div>
          <div class="stat-label">${stat.label}</div>
        </div>
      `).join('');

      // 只更新第一個分析網格（統計部分）
      const grids = document.querySelectorAll('.analysis-grid');
      if (grids.length > 0) {
        grids[0].innerHTML = statsHTML;
      }
    }
  }

  // 渲染認證徽章
  if (content.certifications && content.certifications.length > 0) {
    const certifications = document.querySelector('.certifications');
    if (certifications) {
      certifications.innerHTML = content.certifications.map(cert => `
        <div class="cert-badge">
          <div class="cert-icon">${cert.icon}</div>
          <p><strong>${cert.title}</strong><br>${cert.subtitle}</p>
        </div>
      `).join('');
    }
  }

  // 渲染行業方案
  renderIndustryContent('semiconductor');
}

// 動態渲染行業方案
function renderIndustryContent(industry) {
  if (!window.globalContent) return;

  const content = window.globalContent;
  const industryData = content.industries[industry] || [];
  const cardsContainer = document.getElementById(`${industry}-cards`);

  if (cardsContainer && industryData.length > 0) {
    cardsContainer.innerHTML = industryData.map((plan, index) => `
      <div class="industry-card" style="animation-delay: ${index * 0.1}s;">
        <h3>${plan.title}</h3>
        <p>${plan.description}</p>
        ${(plan.benefits || []).map(benefit => `<div class="industry-benefit">${benefit}</div>`).join('')}
      </div>
    `).join('');
  }
}

// 行業標籤切換事件
function setupIndustryTabs() {
  document.querySelectorAll('.industry-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const industry = this.getAttribute('data-industry');

      // 更新標籤狀態
      document.querySelectorAll('.industry-tab').forEach(t => {
        t.classList.remove('active');
      });
      this.classList.add('active');

      // 隱藏所有卡片
      document.querySelectorAll('.industry-cards').forEach(cards => {
        cards.style.display = 'none';
      });

      // 顯示選中的卡片
      renderIndustryContent(industry);
      const selectedCards = document.getElementById(`${industry}-cards`);
      if (selectedCards) {
        selectedCards.style.display = 'grid';
      }
    });
  });
}

// 表單提交
function setupFormSubmission() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const company = document.getElementById('company').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const requirements = document.getElementById('requirements').value.trim();

    // 驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\-\+\s\(\)]+$/;

    if (!emailRegex.test(email)) {
      showMessage('請輸入有效的電郵地址', 'error');
      return;
    }

    if (!phoneRegex.test(phone)) {
      showMessage('請輸入有效的電話號碼', 'error');
      return;
    }

    if (!name || !company || !phone || !email || !requirements) {
      showMessage('請填寫所有必填欄位', 'error');
      return;
    }

    // 提交到 Supabase
    const result = await window.submitContactForm({
      name, company, phone, email, requirements
    });

    if (result.success) {
      showMessage('感謝您的咨詢！我們將在 24 小時內與您聯絡。', 'success');
      contactForm.reset();
    } else {
      showMessage('提交失敗，請稍後重試', 'error');
    }
  });
}

function showMessage(message, type) {
  const formMessage = document.getElementById('formMessage');
  if (!formMessage) return;

  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;

  setTimeout(() => {
    formMessage.className = 'form-message';
  }, 3000);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 等待 Supabase 內容加載
  setTimeout(() => {
    renderDynamicContent();
    setupIndustryTabs();
    setupFormSubmission();
  }, 500);
});
