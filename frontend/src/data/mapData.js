
const rawHTML = `
   <area target="" alt="" title="" href="" coords="378,765,411,705,339,663,304,724" shape="poly">
    <area target="" alt="" title="" href="" coords="615,995,583,1045,439,960,468,908" shape="poly">
    <area target="" alt="" title="" href="" coords="440,693,396,769,445,799,448,792,463,802,508,728" shape="poly">
    <area target="" alt="" title="" href="" coords="278,691,299,644,181,574,150,623" shape="poly">
    <area target="" alt="" title="" href="" coords="235,458,193,534,277,572,314,504" shape="poly">
    <area target="" alt="" title="" href="" coords="278,365,308,388,269,447,239,422" shape="poly">
    <area target="" alt="" title="" href="" coords="101,541,78,589,2,550,30,502" shape="poly">
    <area target="" alt="" title="" href="" coords="82,391,52,451,126,485,157,427" shape="poly">
    <area target="" alt="" title="" href="" coords="178,253,210,198,220,206,228,192,237,192,234,197,250,207,211,271" shape="poly">
    <area target="" alt="" title="" href="" coords="406,13,574,14,577,47,406,47" shape="poly">
    <area target="" alt="" title="" href="" coords="534,213,535,246,540,248,539,294,601,295,602,269,771,269,771,234,723,233,723,223,712,212,694,212,686,201,621,202,619,209" shape="poly">
    <area target="" alt="" title="" href="" coords="771,235,820,235,820,276,868,275,869,256,937,255,941,272,920,270,920,278,938,279,939,367,902,369,902,327,808,326,809,336,735,338,735,314,771,311" shape="poly">
    <area target="" alt="" title="" href="" coords="346,149,346,197,372,200,376,217,357,218,357,246,477,245,477,220,471,217,471,202,477,199,476,150" shape="poly">
    <area target="" alt="" title="" href="" coords="858,434,859,486,867,490,865,562,858,564,859,630,867,630,866,643,870,642,870,651,876,653,878,657,968,657,969,653,977,652,978,642,987,645,984,585,958,583,959,540,982,538,980,517,975,499,964,485,950,473,935,467,914,462,914,435" shape="poly">
    <area target="" alt="" title="" href="" coords="1050,737,1049,756,1066,770,1084,771,1098,755,1098,737,1083,722,1065,721" shape="poly">
    <area target="" alt="" title="" href="" coords="1043,624,1043,667,1055,667,1057,685,1146,685,1146,658,1136,659,1137,626" shape="poly">
    <area target="" alt="" title="" href="" coords="1035,498,1036,559,1158,558,1159,565,1190,564,1189,556,1199,556,1199,529,1188,529,1187,499" shape="poly">
    <area target="" alt="" title="" href="" coords="1090,402,1100,404,1101,381,1166,381,1165,431,1090,429" shape="poly">
    <area target="" alt="" title="" href="" coords="969,1071,956,1096,1014,1131,1023,1120,1075,1150,1089,1119,1035,1085,1038,1074,993,1052,981,1074" shape="poly">
    <area target="" alt="" title="" href="" coords="867,703,867,808,884,808,884,814,890,814,891,823,901,823,901,833,864,832,864,855,886,855,886,868,949,868,948,834,959,835,958,851,975,851,975,830,977,830,977,817,962,811,949,817,949,792,958,793,959,784,969,784,969,771,976,771,976,689,943,688,943,685,902,685,900,703" shape="poly">
    <area target="" alt="" title="" href="" coords="652,1055,676,1070,668,1085,828,1177,838,1166,842,1166,844,1174,847,1184,855,1188,861,1195,870,1195,879,1193,888,1188,891,1181,895,1170,895,1160,890,1151,879,1144,867,1141,855,1143,848,1146,849,1136,834,1124,836,1121,676,1031,668,1041,665,1037,663,1024,656,1014,644,1008,635,1008,626,1011,619,1017,614,1023,610,1032,612,1040,616,1050,624,1055,634,1059,644,1058" shape="poly">
    <area target="" alt="" title="" href="" coords="525,774,494,830,636,913,668,859,680,867,706,820,702,818,695,827,642,796,646,789,630,779,632,775,587,750,583,759,550,740,529,775" shape="poly">
    <area target="" alt="" title="" href="" coords="665,890,658,904,847,1015,844,1023,889,1049,895,1038,908,1046,940,990,945,993,954,978,914,956,904,972,882,959,874,972,842,955,833,970,680,882,672,894" shape="poly">
    <area target="" alt="" title="" href="" coords="866,894,850,913,859,920,848,938,870,951,884,929,947,972,964,947,962,943,967,932,945,915,937,917,911,900,904,916,876,896" shape="poly">
    <area target="" alt="" title="" href="" coords="611,910,605,920,588,909,593,899" shape="poly">
    <area target="" alt="" title="" href="" coords="639,925,621,917,615,928,634,938" shape="poly">
    <area target="" alt="" title="" href="" coords="665,939,647,931,642,942,660,951" shape="poly">
    <area target="" alt="" title="" href="" coords="698,959,679,949,675,959,692,969" shape="poly">
    <area target="" alt="" title="" href="" coords="726,975,709,965,703,976,721,985" shape="poly">
    <area target="" alt="" title="" href="" coords="757,992,739,982,735,993,753,1003" shape="poly">
    <area target="" alt="" title="" href="" coords="767,999,787,1009,781,1020,763,1011" shape="poly">
    <area target="" alt="" title="" href="" coords="797,1014,814,1025,809,1036,791,1026" shape="poly">
    <area target="" alt="" title="" href="" coords="825,1032,843,1042,837,1053,820,1042" shape="poly">
    <area target="" alt="" title="" href="" coords="853,1046,870,1055,865,1067,847,1058" shape="poly">
    <area target="" alt="" title="" href="" coords="878,1061,895,1071,890,1080,872,1072" shape="poly">
    <area target="" alt="" title="" href="" coords="916,1050,927,1032,937,1039,927,1056" shape="poly">
    <area target="" alt="" title="" href="" coords="934,1081,944,1087,933,1105,923,1098" shape="poly">
    <area target="" alt="" title="" href="" coords="943,1004,953,1009,942,1026,932,1020" shape="poly">
    <area target="" alt="" title="" href="" coords="969,1025,980,1031,969,1050,958,1041" shape="poly">
    <area target="" alt="" title="" href="" coords="949,1052,960,1057,949,1074,938,1069" shape="poly">
    <area target="" alt="" title="" href="" coords="954,988,965,968,976,975,965,994" shape="poly">
    <area target="" alt="" title="" href="" coords="973,1014,984,995,994,1000,984,1019" shape="poly">
    <area target="" alt="" title="" href="" coords="1000,971,1011,975,1002,991,991,988" shape="poly">
    <area target="" alt="" title="" href="" coords="980,940,991,946,980,964,969,959" shape="poly">
    <area target="" alt="" title="" href="" coords="1003,955,1013,938,1023,943,1015,961" shape="poly">
    <area target="" alt="" title="" href="" coords="554,876,571,885,566,896,548,888" shape="poly">
    <area target="" alt="" title="" href="" coords="527,861,546,872,541,882,523,872" shape="poly">
    <area target="" alt="" title="" href="" coords="501,847,521,857,515,868,497,859" shape="poly">
    <area target="" alt="" title="" href="" coords="472,830,492,841,486,851,468,842" shape="poly">
    <area target="" alt="" title="" href="" coords="424,804,443,812,439,823,420,815" shape="poly">
    <area target="" alt="" title="" href="" coords="394,786,413,796,408,807,390,798" shape="poly">
    <area target="" alt="" title="" href="" coords="364,771,382,779,377,789,359,781" shape="poly">
    <area target="" alt="" title="" href="" coords="336,753,354,763,350,774,332,765" shape="poly">
    <area target="" alt="" title="" href="" coords="308,738,325,747,321,758,302,749" shape="poly">
    <area target="" alt="" title="" href="" coords="269,715,288,724,282,734,264,726" shape="poly">
    <area target="" alt="" title="" href="" coords="239,698,257,707,253,718,234,708" shape="poly">
    <area target="" alt="" title="" href="" coords="211,681,230,691,223,702,204,692" shape="poly">
    <area target="" alt="" title="" href="" coords="180,665,175,675,192,686,199,674" shape="poly">
    <area target="" alt="" title="" href="" coords="150,648,168,657,164,670,145,660" shape="poly">
    <area target="" alt="" title="" href="" coords="120,632,137,640,132,652,114,642" shape="poly">
    <area target="" alt="" title="" href="" coords="112,605,124,611,114,628,102,624" shape="poly">
    <area target="" alt="" title="" href="" coords="91,572,102,576,92,595,81,589" shape="poly">
    <area target="" alt="" title="" href="" coords="97,560,105,542,115,548,105,566" shape="poly">
    <area target="" alt="" title="" href="" coords="146,543,158,548,148,567,137,560" shape="poly">
    <area target="" alt="" title="" href="" coords="121,512,132,517,122,535,111,529" shape="poly">
    <area target="" alt="" title="" href="" coords="136,481,146,486,137,504,125,500" shape="poly">
    <area target="" alt="" title="" href="" coords="160,514,172,518,163,538,152,534" shape="poly">
    <area target="" alt="" title="" href="" coords="177,483,187,489,178,507,167,501" shape="poly">
    <area target="" alt="" title="" href="" coords="152,447,161,452,153,470,143,465" shape="poly">
    <area target="" alt="" title="" href="" coords="191,452,202,456,193,475,181,470" shape="poly">
    <area target="" alt="" title="" href="" coords="167,417,178,422,169,441,157,435" shape="poly">
    <area target="" alt="" title="" href="" coords="198,436,210,442,219,424,208,419" shape="poly">
    <area target="" alt="" title="" href="" coords="182,386,193,391,185,409,172,403" shape="poly">
    <area target="" alt="" title="" href="" coords="223,387,234,393,224,411,213,405" shape="poly">
    <area target="" alt="" title="" href="" coords="197,357,208,360,199,380,187,375" shape="poly">
    <area target="" alt="" title="" href="" coords="237,358,248,363,241,380,231,377" shape="poly">
    <area target="" alt="" title="" href="" coords="213,327,222,331,213,350,202,343" shape="poly">
    <area target="" alt="" title="" href="" coords="227,295,238,300,231,318,220,313" shape="poly">
    <area target="" alt="" title="" href="" coords="252,328,263,334,253,352,243,347" shape="poly">
    <area target="" alt="" title="" href="" coords="268,299,278,304,269,321,258,316" shape="poly">
    <area target="" alt="" title="" href="" coords="283,267,293,272,285,289,274,286" shape="poly">
    <area target="" alt="" title="" href="" coords="290,252,301,256,310,239,299,233" shape="poly">
    <area target="" alt="" title="" href="" coords="244,257,255,262,246,280,234,277" shape="poly">
    <area target="" alt="" title="" href="" coords="259,228,269,232,260,251,250,245" shape="poly">
    <area target="" alt="" title="" href="" coords="275,197,285,203,276,221,266,215" shape="poly">
    <area target="" alt="" title="" href="" coords="292,167,302,172,293,190,283,185" shape="poly">
    <area target="" alt="" title="" href="" coords="308,136,298,153,309,159,319,142" shape="poly">
    <area target="" alt="" title="" href="" coords="322,107,333,111,323,130,313,125" shape="poly">
    <area target="" alt="" title="" href="" coords="363,124,374,128,364,147,353,144" shape="poly">
    <area target="" alt="" title="" href="" coords="380,93,390,98,381,116,369,111" shape="poly">
    <area target="" alt="" title="" href="" coords="337,78,347,83,339,101,327,96" shape="poly">
    <area target="" alt="" title="" href="" coords="408,97,426,101,423,114,404,108" shape="poly">
    <area target="" alt="" title="" href="" coords="414,74,432,78,431,89,411,84" shape="poly">
    <area target="" alt="" title="" href="" coords="443,79,463,85,460,95,441,91" shape="poly">
    <area target="" alt="" title="" href="" coords="436,104,456,108,454,122,433,116" shape="poly">
    <area target="" alt="" title="" href="" coords="471,112,490,117,488,128,468,124" shape="poly">
    <area target="" alt="" title="" href="" coords="478,89,498,92,494,104,476,100" shape="poly">
    <area target="" alt="" title="" href="" coords="538,101,557,105,556,117,536,113" shape="poly">
    <area target="" alt="" title="" href="" coords="533,124,554,130,550,142,532,136" shape="poly">
    <area target="" alt="" title="" href="" coords="568,108,587,114,586,125,566,121" shape="poly">
    <area target="" alt="" title="" href="" coords="564,132,582,137,582,149,561,145" shape="poly">
    <area target="" alt="" title="" href="" coords="603,115,622,121,620,133,600,128" shape="poly">
    <area target="" alt="" title="" href="" coords="598,140,617,144,617,156,595,152" shape="poly">
    <area target="" alt="" title="" href="" coords="635,121,654,127,653,138,633,134" shape="poly">
    <area target="" alt="" title="" href="" coords="639,147,658,152,658,164,637,159" shape="poly">
    <area target="" alt="" title="" href="" coords="670,155,688,158,687,172,667,166" shape="poly">
    <area target="" alt="" title="" href="" coords="665,128,684,135,682,145,663,142" shape="poly">
    <area target="" alt="" title="" href="" coords="703,161,723,165,721,178,700,173" shape="poly">
    <area target="" alt="" title="" href="" coords="699,137,719,142,717,153,697,149" shape="poly">
    <area target="" alt="" title="" href="" coords="738,142,757,146,756,157,737,153" shape="poly">
    <area target="" alt="" title="" href="" coords="741,168,760,174,758,185,739,179" shape="poly">
    <area target="" alt="" title="" href="" coords="768,149,788,154,787,166,766,160" shape="poly">
    <area target="" alt="" title="" href="" coords="772,175,791,180,789,191,769,187" shape="poly">
    <area target="" alt="" title="" href="" coords="811,158,831,163,828,175,809,171" shape="poly">
    <area target="" alt="" title="" href="" coords="810,186,828,190,827,201,808,198" shape="poly">
    <area target="" alt="" title="" href="" coords="849,166,868,171,867,182,846,177" shape="poly">
    <area target="" alt="" title="" href="" coords="846,193,864,198,861,210,842,204" shape="poly">
    <area target="" alt="" title="" href="" coords="879,172,898,178,898,189,876,185" shape="poly">
    <area target="" alt="" title="" href="" coords="876,200,872,211,891,216,894,206" shape="poly">
    <area target="" alt="" title="" href="" coords="914,180,933,184,932,195,911,192" shape="poly">
    <area target="" alt="" title="" href="" coords="910,206,908,217,926,223,928,211" shape="poly">
    <area target="" alt="" title="" href="" coords="952,184,969,189,969,201,949,196" shape="poly">
    <area target="" alt="" title="" href="" coords="945,213,964,219,962,231,942,224" shape="poly">
    <area target="" alt="" title="" href="" coords="981,191,1001,196,999,208,978,202" shape="poly">
    <area target="" alt="" title="" href="" coords="975,221,993,225,993,238,972,233" shape="poly">
    <area target="" alt="" title="" href="" coords="1026,244,1037,244,1037,263,1024,262" shape="poly">
    <area target="" alt="" title="" href="" coords="1024,277,1036,277,1036,298,1023,297" shape="poly">
    <area target="" alt="" title="" href="" coords="997,247,1009,247,1008,266,995,266" shape="poly">
    <area target="" alt="" title="" href="" coords="995,280,1006,279,1005,299,994,300" shape="poly">
    <area target="" alt="" title="" href="" coords="1020,320,1032,319,1031,338,1019,340" shape="poly">
    <area target="" alt="" title="" href="" coords="992,311,1003,310,1003,330,991,331" shape="poly">
    <area target="" alt="" title="" href="" coords="1020,361,1031,361,1031,381,1019,381" shape="poly">
    <area target="" alt="" title="" href="" coords="991,340,1002,338,1002,359,990,359" shape="poly">
    <area target="" alt="" title="" href="" coords="1017,402,1031,402,1030,423,1016,423" shape="poly">
    <area target="" alt="" title="" href="" coords="1021,537,1033,537,1032,559,1020,559" shape="poly">
    <area target="" alt="" title="" href="" coords="990,372,1002,372,1002,394,989,393" shape="poly">
    <area target="" alt="" title="" href="" coords="992,421,1003,422,1003,443,992,442" shape="poly">
    <area target="" alt="" title="" href="" coords="991,454,1004,454,1003,473,991,473" shape="poly">
    <area target="" alt="" title="" href="" coords="990,483,1002,483,1002,502,989,503" shape="poly">
    <area target="" alt="" title="" href="" coords="990,516,1001,516,1001,536,988,536" shape="poly">
    <area target="" alt="" title="" href="" coords="990,548,1001,547,1000,568,988,569" shape="poly">
    <area target="" alt="" title="" href="" coords="1022,572,1034,572,1032,592,1020,591" shape="poly">
    <area target="" alt="" title="" href="" coords="990,580,1002,581,1001,600,989,601" shape="poly">
    <area target="" alt="" title="" href="" coords="990,614,1002,614,1002,633,989,634" shape="poly">
    <area target="" alt="" title="" href="" coords="1022,639,1033,640,1034,660,1021,660" shape="poly">
    <area target="" alt="" title="" href="" coords="989,648,999,648,999,668,987,669" shape="poly">
    <area target="" alt="" title="" href="" coords="1022,673,1034,673,1034,692,1022,692" shape="poly">
    <area target="" alt="" title="" href="" coords="989,682,999,681,999,701,987,703" shape="poly">
    <area target="" alt="" title="" href="" coords="1022,708,1033,708,1033,729,1021,729" shape="poly">
    <area target="" alt="" title="" href="" coords="989,719,1000,719,1000,740,987,740" shape="poly">
    <area target="" alt="" title="" href="" coords="1022,743,1033,743,1033,762,1022,762" shape="poly">
    <area target="" alt="" title="" href="" coords="1025,779,1035,780,1036,798,1023,798" shape="poly">
    <area target="" alt="" title="" href="" coords="986,753,999,753,998,773,986,774" shape="poly">
    <area target="" alt="" title="" href="" coords="1024,812,1036,812,1035,832,1023,831" shape="poly">
    <area target="" alt="" title="" href="" coords="1027,869,1039,868,1038,889,1027,888" shape="poly">
    <area target="" alt="" title="" href="" coords="987,786,998,786,998,806,986,806" shape="poly">
    <area target="" alt="" title="" href="" coords="987,826,999,825,998,846,986,844" shape="poly">
    <area target="" alt="" title="" href="" coords="1028,903,1039,903,1038,922,1028,921" shape="poly">
    <area target="" alt="" title="" href="" coords="982,859,995,859,993,879,983,879" shape="poly">
    <area target="" alt="" title="" href="" coords="984,893,997,893,995,915,984,915" shape="poly">

`;

// 2. ฟังก์ชันดึงเฉพาะตัวเลข coords ออกมาด้วย Regex
const extractCoords = (html) => {
  const matches = html.match(/coords="([^"]+)"/g);
  return matches ? matches.map(m => m.replace('coords="', '').replace('"', '')) : [];
};

// 3. ฟังก์ชันแปลงรูปแบบ a,b,c,d ให้กลายเป็น a,b c,d (สำหรับ SVG)
const formatPoints = (str) => {
  const parts = str.split(',');
  let points = [];
  for (let i = 0; i < parts.length; i += 2) {
    points.push(`${parts[i]},${parts[i+1]}`);
  }
  return points.join(' ');
};

const customNames = {
  // --- แก้ชื่อตึก ---
  "Bldg_1": "ศูนย์คอมพิวเตอร์วิศวกรรม",
  "Bldg_2": "คณะบริหาร  มหาวิทยาลัยเกษตรศาสตร์",
  "Bldg_3": "อาคารภาควิชาวิศวกรรมอุตสาหการ มหาวิทยาลัยเกษตรศาสตร์",
  "Bldg_4": "สหกรณ์ออมทรัพย์มหาวิทยาลัยเกษตรศาสตร์ จำกัด",
  "Bldg_5": "ศูนย์กิจกรรมนิสิต มหาวิทยาลัยเกษตรศาสตร์",
  "Bldg_6": "ลานแดง",
  "Bldg_7": "ร้านสหกรณ์มหาวิทยาลัยเกษตรศาสตร์",
  "Bldg_8": "อาคารอเนกประสงค์",
  "Bldg_9": "สนามบาสเกตบอลกลางแจ้ง",
  "Bldg_10": "อาคารสภาผู้แทนนิสิต",
  "Bldg_11": "อาคารภาควิชาวิศวกรรมเคมี คณะวิศวกรรม",
  "Bldg_12": "อาคารนานาชาติ (IUP) - โรงอาหาร คณะวิศวกรรมศาสตร์",
  "Bldg_13": "สถานพยาบาล มหาวิทยาลัยเกษตรศาสตร์",
  "Bldg_14": "ตึกชูชาติ กำภู คณะวิศวกรรมศาสตร์",
  "Bldg_15": "เรือนเพาะชำ",
  "Bldg_16": "อาคารยงยุทธ เจียมไชยศรี คณะวิทยาศาสตร์",
  "Bldg_17": "อาคารกฤษณา ชุติมา คณะวิทยาศาสตร์",
  "Bldg_18": "อาคารวิฑูรย์ หงษ์สุมาลย์ คณะวิทยาศาสตร์",
  "Bldg_19": "ตึกศ. คุณชวนชม จันทระเปารยะ ภาควิชาคหกรรมศาสตร์",
  "Bldg_20": "อาคารปฏิบัติการ คณะเศรษฐศาสตร์",
  "Bldg_21": "อาคารจอดรถงามวงศ์วาน 2",
  "Bldg_22": "บาร์บริหาร (บาร์บัส)",
  "Bldg_23": "คณะเศรษฐศาสตร์ มหาวิทยาลัยเกษตรศาสตร์",
  "Bldg_24": "ศูนย์วิจัยเศรษฐศาสตร์ประยุกต์",
  // (ตึกไหนที่ไม่ได้เขียนไว้ในนี้ ระบบจะใช้ชื่อ "อาคาร X" เหมือนเดิม)

  // --- แก้ชื่อล็อค (ถ้าต้องการเปลี่ยนจาก E001 เป็นชื่ออื่น) ---
  "E001": "ล็อคหัวมุม A",
  "E088": "ล็อคพิเศษหน้ามอ"
};

const allCoords = extractCoords(rawHTML).map(formatPoints);

export const buildings = [];
export const initialStalls = [];

allCoords.forEach((points, index) => {
  const realIndex = index + 1; 
  
  // แก้ไขเงื่อนไข: 1-24 เป็นอาคาร (ตึก)
  if (realIndex <= 24) {
    const bldgId = `Bldg_${realIndex}`;
    buildings.push({
      id: bldgId,
      name: customNames[bldgId] || `อาคาร ${realIndex}`, 
      points: points
    });
  } else {
    // แก้ไขเงื่อนไข: ที่เหลือเป็นร้านค้า (เอาตำแหน่งจริงลบด้วย 27)
    // เช่น ตำแหน่งที่ 25 จะกลายเป็น 25 - 24 = 1 (ได้รหัส E001)
    const stallNumber = realIndex - 24; 
    const stallId = `E${stallNumber.toString().padStart(3, '0')}`;
    initialStalls.push({
      id: customNames[stallId] || stallId, 
      status: 'available',
      points: points
    });
  }
});