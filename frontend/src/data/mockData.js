// ไฟล์: src/data/mockData.js

// 1. ข้อมูลร้านค้าที่เปิดแล้ว
export const activeShops = {
  'E002': { 
    shopName: 'ไก่ทอดนาย ก.',
    categories: ['ของทานเล่น', 'อาหารทอด'],
    image: 'https://img.wongnai.com/p/1968x0/2019/06/20/aa0b37df08d34215b361185a267cae05.jpg',
    menus: [
      { name: 'ไก่ทอดหาดใหญ่', price: 50 },
      { name: 'เฟรนช์ฟรายส์ชีส', price: 40 },
      { name: 'ข้าวเหนียว', price: 10 }
    ]
  },
  // อนาคตอยากเพิ่มร้านไหน ก็มาเขียนต่อตรงนี้ได้เลยครับ
};

// 2. ข้อมูลรายละเอียดตึก
export const buildingInfo = {
  "Bldg_1": { 
    image: "https://scontent.fbkk4-3.fna.fbcdn.net/v/t39.30808-6/300789942_727994745057006_8992375833631654525_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=2a1932&_nc_eui2=AeHFZRbJywR-e0dbvAmdxNesvaWKqbJ_jOW9pYqpsn-M5SG79RvI149P0y242mcEbVI9DaRMRCzth56LpxUZj0L4&_nc_ohc=TEortbnd9yQQ7kNvwGlSJsr&_nc_oc=Adn66IF4bN33aZmxZWWYSrEU18xeZRIHSH8O3u_SE6lrTVgx7zEPU0xgKcTdaXbBsKI&_nc_zt=23&_nc_ht=scontent.fbkk4-3.fna&_nc_gid=iwV6zYdawCNMJQvGb_nQLA&oh=00_AfuuZg5tPy9I43itbeTBiGMag-xlmAXnem7MvmCbQeUKkw&oe=69A52A93", 
    desc: "ศูนย์คอมพิวเตอร์วิศวกรรม" 
  },
  "Bldg_2": { 
    image: "https://bus.ku.ac.th/new/th/img/page_history/year2017-ku.jpg", 
    desc: "คณะบริหาร  มหาวิทยาลัยเกษตรศาสตร์" 
  },
  "Bldg_3": { 
    image: "https://ie.eng.ku.ac.th/web2017/wp-content/uploads/2022/10/%E0%B8%AD%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%A3-7.jpg", 
    desc: "อาคารภาควิชาวิศวกรรมอุตสาหการ มหาวิทยาลัยเกษตรศาสตร์" 
  },
  "Bldg_4": { 
    image: "https://lh3.googleusercontent.com/gps-cs-s/AHVAwerOYrqwDDAKhkc78tbjE8uj9LjoUe4YVfn1v8zWDru-jzChKWKsI1JNyOlXe9U-o2UoyPMF2RP1felzQPP3bc4EYtmI46HFLFqw9gEKHJKibqF75cXuBqTTmhhVua0sv1bjU1JJHA=w408-h272-k-no", 
    desc: "สหกรณ์ออมทรัพย์มหาวิทยาลัยเกษตรศาสตร์ จำกัด" 
  },
  "Bldg_5": { 
    image: "/อาคารศูนย์กิจกรรมนิสิต มหาวิทยาลัยเกษตรศาสตร์.jpg", 
    desc: "ศูนย์กิจกรรมนิสิต มหาวิทยาลัยเกษตรศาสตร์" 
  },
  "Bldg_6": { 
    image: "/ลานแดง.jpg", 
    desc: "ลานแดง" 
  },
  "Bldg_7": { 
    image: "https://lh3.googleusercontent.com/gps-cs-s/AHVAwerEeAK5Ke0ilUj27y9LDxZ5ThTEtNGOPehQqW5YqEmCnjN8gnZZgh_FWyF-dgseRACp7H2ef0D7SWp5V89fWE04KAw2HF8KHlEdzgdHI9fwyCDoT9lBoG6LM9gbcSOWcC_FKY-HzsQbLRQ=w408-h306-k-no", 
    desc: "ร้านสหกรณ์มหาวิทยาลัยเกษตรศาสตร์" 
  },
  "Bldg_8": { 
    image: "/อาคารอเนกประสงค์.jpg", 
    desc: "อาคารอเนกประสงค์" 
  },
  "Bldg_9": { 
    image: "https://sac.ku.ac.th/wp-content/uploads/2024/07/%E0%B8%9A%E0%B8%B2%E0%B8%AA%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%87%E0%B9%81%E0%B8%88%E0%B9%89%E0%B8%87-1536x864.jpg", 
    desc: "สนามบาสเกตบอลกลางแจ้ง" 
  },
  "Bldg_10": { 
    image: "/อาคารสภาผู้แทนนิสิต.jpg", 
    desc: "อาคารสภาผู้แทนนิสิต องค์การนิสิต มหาวิทยาลัยเกษตรศาสตร์" 
  },
  "Bldg_11": { 
    image: "https://scontent.fbkk4-2.fna.fbcdn.net/v/t39.30808-6/638321485_2796569117355718_1790707310421120258_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=e06c5d&_nc_eui2=AeGcMcMYyYvPrNg4nqU3vOq8Nl2N8-6SHd82XY3z7pId3_eB6DZ-Ch7NsxBHiyTVstEJ40ikJWDQeenDwOuAUqW6&_nc_ohc=NQGw1O4ABjIQ7kNvwGMeBPr&_nc_oc=AdmmSnpWV5r_2MQNw6-shh4W9E4qDYC3kdEuL1riWGBCmfqp2TdwBa4z77JZVkb5oyw&_nc_zt=23&_nc_ht=scontent.fbkk4-2.fna&_nc_gid=F08Y1E6zgTEfXpYvl4_Xfg&oh=00_AfsCHDJPNatchw1pJO-dg37l21fmEtYatBzLvLEJaLv4CA&oe=69A4F12D", 
    desc: "อาคารภาควิชาวิศวกรรมเคมี คณะวิศวกรรม" 
  },
  "Bldg_12": { 
    image: "https://iup.eng.ku.ac.th/wp-content/uploads/2020/07/iupb.jpg", 
    desc: "อาคารนานาชาติ (IUP) - โรงอาหาร คณะวิศวกรรมศาสตร์" 
  },
  "Bldg_13": { 
    image: "https://inf-dev.ku.ac.th/intl/th/wp-content/uploads/2022/12/primary-banner.jpg", 
    desc: "สถานพยาบาล มหาวิทยาลัยเกษตรศาสตร์" 
  },
  "Bldg_14": { 
    image: "https://scontent.fbkk4-1.fna.fbcdn.net/v/t39.30808-6/503126138_4562573913987224_1237651269528125105_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=0327a3&_nc_eui2=AeFIBjIIM_1NpR7J5A9sYwWCwCzmsVTG1qjALOaxVMbWqBWq3MFpZyM893bS3_5Fw4JV-PQTBVT1J5WGNSIaM7-0&_nc_ohc=2R1-HosTU6EQ7kNvwFB53JM&_nc_oc=Adnjvg0yh85WjYRnhaXF9cG4BlVG6lB73l3kLJQHseEfnzrsQZ9DLPoBuwL-wAmnDHE&_nc_zt=23&_nc_ht=scontent.fbkk4-1.fna&_nc_gid=N-BqCjzEFSjb1FhEGwKMPA&oh=00_AfsSaII2fd2A2bnreNaZt3PLEq2IFIV3qola5nrK58sY3A&oe=69A4E348", 
    desc: "ตึกชูชาติ กำภู คณะวิศวกรรมศาสตร์" 
  },
  "Bldg_15": { 
    image: "/เรือนเพาะชำ.jpg", 
    desc: "เรือนเพาะชำ" 
  },
  "Bldg_16": { 
    image: "https://www.sci.ku.ac.th/web2019/wp-content/uploads/2022/06/%E0%B8%A2%E0%B8%87%E0%B8%A2%E0%B8%B8%E0%B8%97.jpg", 
    desc: "อาคารยงยุทธ เจียมไชยศรี คณะวิทยาศาสตร์" 
  },
  "Bldg_17": { 
    image: "https://www.sci.ku.ac.th/web2019/wp-content/uploads/2022/06/%E0%B8%81%E0%B8%A4%E0%B8%A9%E0%B8%93%E0%B8%B2.jpg", 
    desc: "อาคารกฤษณา ชุติมา คณะวิทยาศาสตร์" 
  },
  "Bldg_18": { 
    image: "https://www.sci.ku.ac.th/web2019/wp-content/uploads/2022/06/physic.jpg", 
    desc: "อาคารวิฑูรย์ หงษ์สุมาลย์ คณะวิทยาศาสตร์" 
  },
  "Bldg_19": { 
    image: "https://lh3.googleusercontent.com/gps-cs-s/AHVAwepu11LChVD43uWbYSC-2yi77FlYjU2xAtDpkOTacULBO5d4h0kB_pf7S0kJ0Ib_iVOL040ev38yCl6qojamj7TxGQ10xxw4sqTFfYz5NJibRmjuE66LMfwKqAoMbAO0XPNKyGFZ-w=s1360-w1360-h1020-rw", 
    desc: "ตึกศ. คุณชวนชม จันทระเปารยะ ภาควิชาคหกรรมศาสตร์" 
  },
  "Bldg_20": { 
    image: "https://campus.campus-star.com/app/uploads/2019/01/eco-ku-15.jpg", 
    desc: "อาคารปฏิบัติการ คณะเศรษฐศาสตร์" 
  },
  "Bldg_21": { 
    image: "/อาคารจอดรถงามวงศ์วาน 2.jpg", 
    desc: "อาคารจอดรถงามวงศ์วาน 2" 
  },
  "Bldg_22": { 
    image: "https://img.wongnai.com/p/1920x0/2023/10/20/18c838ee521e42baaa9ea2b65c80554b.jpg", 
    desc: "บาร์บริหาร (บาร์บัส)" 
  },
  "Bldg_23": { 
    image: "https://lh3.googleusercontent.com/gps-cs-s/AHVAweoRWgqPvBj8bjv-h1aLIQcv1Oih87YMkjMOmVnXYkNxC0d4yB31VpgLVGeO_sBNbTG0mb3SCRXrEt24VwaLHAGNLVx9_Lr8Af4eYLMy0Yf_gUis8JJMxXgmvn8I0xU7ZYai1EE=w426-h240-k-no", 
    desc: "คณะเศรษฐศาสตร์ มหาวิทยาลัยเกษตรศาสตร์" 
  },
  "Bldg_24": { 
    image: "https://scontent.fbkk4-1.fna.fbcdn.net/v/t39.30808-6/481899828_660134566581125_8170161793788092951_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=2a1932&_nc_eui2=AeFmMcjOYVafA0csysoDUBF3H6dK9zwRTJcfp0r3PBFMlz4Yw4IREUqOFP2iAURyOfvXdW91KF9Zv1TvP2ZBT5Qr&_nc_ohc=VQlqqp7klxoQ7kNvwFmCVnO&_nc_oc=AdlVsP-kEV_9X2AdTFg_KA8mbftMdXpjkZLu-9IymWGwzw6LhLMyRvZX3KmctYKyMBY&_nc_zt=23&_nc_ht=scontent.fbkk4-1.fna&_nc_gid=YKD5HGWCmFIV9yIyGPG4xQ&oh=00_AfuxVJC2nvTKVqxZQcSHABfB6jJNsEUXXwuDI7o9AzUiig&oe=69A4E13F", 
    desc: "ศูนย์วิจัยเศรษฐศาสตร์ประยุกต์ (Economics, Building 5)" 
  }
  
};