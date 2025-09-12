let map;
function initMap(){
  const mapDiv=document.getElementById('map');
  if(!mapDiv) return;
  map=new google.maps.Map(mapDiv,{zoom:12,center:{lat:24.7136,lng:46.6753}});
  // مثال: إضافة marker
  const marker=new google.maps.Marker({position:{lat:24.7136,lng:46.6753},map:map,title:"موقع المندوب"});
}
