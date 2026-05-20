// Supabase 配置和初始化
const SUPABASE_URL = 'https://euirazpintnlbfhymtbj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aXJhenBpbnRubGJmaHltdGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNTE4NTksImV4cCI6MjA5NDgyNzg1OX0.7RHJ2CYkkHoxL-x51tfqVUzuTJJkHGJQSsihzXCRtpg';

// 初始化 Supabase 客戶端
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 全局內容存儲
let globalContent = {
  hero: {},
  services: [],
  industries: { semiconductor: [], finance: [] },
  stats: [],
  certifications: [],
  benefits: []
};

// 從 Supabase 加載所有內容
async function loadAllContent() {
  try {
    console.log('🔄 正在加載內容...');

    // 加載 Hero 內容
    const { data: heroData, error: heroError } = await supabase
      .from('content_hero')
      .select('*')
      .limit(1)
      .single();
    if (heroError) throw heroError;
    globalContent.hero = heroData;

    // 加載服務
    const { data: servicesData, error: servicesError } = await supabase
      .from('content_services')
      .select('*')
      .order('service_order');
    if (servicesError) throw servicesError;
    globalContent.services = servicesData || [];

    // 加載統計數據
    const { data: statsData, error: statsError } = await supabase
      .from('content_stats')
      .select('*')
      .order('stat_order');
    if (statsError) throw statsError;
    globalContent.stats = statsData || [];

    // 加載行業方案
    const { data: industriesData, error: industriesError } = await supabase
      .from('content_industries')
      .select('*')
      .order('industry_type')
      .order('plan_order');
    if (industriesError) throw industriesError;

    globalContent.industries.semiconductor = industriesData?.filter(i => i.industry_type === 'semiconductor') || [];
    globalContent.industries.finance = industriesData?.filter(i => i.industry_type === 'finance') || [];

    // 加載認證徽章
    const { data: certsData, error: certsError } = await supabase
      .from('content_certifications')
      .select('*')
      .order('cert_order');
    if (certsError) throw certsError;
    globalContent.certifications = certsData || [];

    console.log('✅ 內容加載完成！', globalContent);
    return globalContent;
  } catch (error) {
    console.error('❌ 加載內容出錯：', error);
    return null;
  }
}

// 保存表單提交
async function submitContactForm(formData) {
  try {
    const { data, error } = await supabase
      .from('form_submissions')
      .insert([{
        name: formData.name,
        company: formData.company,
        phone: formData.phone,
        email: formData.email,
        requirements: formData.requirements
      }]);

    if (error) throw error;
    console.log('✅ 表單已保存！', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ 提交表單出錯：', error);
    return { success: false, error };
  }
}

// 獲取所有表單提交（用於後台）
async function getAllSubmissions(adminKey) {
  try {
    // 檢查管理員密鑰（簡單驗證）
    if (adminKey !== 'admin123') {
      throw new Error('未授權');
    }

    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ 獲取提交數據出錯：', error);
    return [];
  }
}

// 動態更新內容（用於後台）
async function updateContent(table, id, updates, adminKey) {
  try {
    if (adminKey !== 'admin123') {
      throw new Error('未授權');
    }

    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    console.log('✅ 內容已更新！');
    return { success: true, data };
  } catch (error) {
    console.error('❌ 更新內容出錯：', error);
    return { success: false, error };
  }
}

// 頁面加載時自動加載內容
document.addEventListener('DOMContentLoaded', async () => {
  await loadAllContent();
});
