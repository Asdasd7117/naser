function setLanguage(lang){
  localStorage.setItem('lang',lang);
}
function toggleLanguage(){
  const lang = localStorage.getItem('lang') || 'ar';
  setLanguage(lang==='ar'?'en':'ar');
  alert('تم تبديل اللغة إلى '+(lang==='ar'?'English':'العربية'));
}
