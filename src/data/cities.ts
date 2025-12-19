/**
 * Comprehensive list of ~1000 major cities worldwide
 * Organized by continent and country for easy maintenance
 */

export const WORLD_CITIES = [
    // INDIA (100 cities)
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Surat', 'Jaipur',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
    'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi',
    'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur',
    'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubballi-Dharwad',
    'Tiruchirappalli', 'Bareilly', 'Mysore', 'Tiruppur', 'Gurgaon', 'Aligarh', 'Jalandhar', 'Bhubaneswar', 'Salem', 'Mira-Bhayandar',
    'Warangal', 'Thiruvananthapuram', 'Guntur', 'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Bikaner', 'Amravati', 'Noida', 'Jamshedpur',
    'Bhilai', 'Cuttack', 'Firozabad', 'Kochi', 'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela',
    'Nanded', 'Kolhapur', 'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni', 'Siliguri', 'Jhansi',
    'Ulhasnagar', 'Jammu', 'Belgaum', 'Mangalore', 'Ambattur', 'Tirunelveli', 'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur',

    // UNITED STATES (100 cities)
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
    'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC',
    'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore',
    'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Mesa', 'Kansas City', 'Atlanta', 'Long Beach', 'Omaha',
    'Raleigh', 'Miami', 'Oakland', 'Minneapolis', 'Tulsa', 'Wichita', 'New Orleans', 'Arlington', 'Cleveland', 'Bakersfield',
    'Tampa', 'Aurora', 'Honolulu', 'Anaheim', 'Santa Ana', 'Corpus Christi', 'Riverside', 'St. Louis', 'Lexington', 'Pittsburgh',
    'Stockton', 'Anchorage', 'Cincinnati', 'St. Paul', 'Toledo', 'Greensboro', 'Newark', 'Plano', 'Henderson', 'Lincoln',
    'Buffalo', 'Jersey City', 'Chula Vista', 'Fort Wayne', 'Orlando', 'St. Petersburg', 'Chandler', 'Laredo', 'Norfolk', 'Durham',
    'Madison', 'Lubbock', 'Irvine', 'Winston-Salem', 'Glendale', 'Garland', 'Hialeah', 'Reno', 'Baton Rouge', 'Irving',
    'Scottsdale', 'North Las Vegas', 'Fremont', 'Gilbert', 'San Bernardino', 'Boise', 'Birmingham', 'Spokane', 'Rochester', 'Modesto',

    // CHINA (80 cities)
    'Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Tianjin', 'Chongqing', 'Wuhan', 'Hangzhou', "Xi'an",
    'Nanjing', 'Shenyang', 'Harbin', 'Qingdao', 'Jinan', 'Dalian', 'Zhengzhou', 'Changchun', 'Kunming', 'Taiyuan',
    'Shijiazhuang', 'Nanchang', 'Changsha', 'Fuzhou', 'Urumqi', 'Lanzhou', 'Hefei', 'Guiyang', 'Nanning', 'Ningbo',
    'Wenzhou', 'Xiamen', 'Suzhou', 'Wuxi', 'Foshan', 'Dongguan', 'Tangshan', 'Baoding', 'Zibo', 'Yantai',
    'Hohhot', 'Xuzhou', 'Luoyang', 'Handan', 'Weifang', 'Zhuhai', 'Shaoxing', 'Jilin', 'Baotou', 'Huizhou',
    'Yinchuan', 'Liuzhou', 'Quanzhou', 'Yangzhou', 'Linyi', 'Ganzhou', 'Daqing', 'Anshan', 'Qiqihar', 'Nantong',
    'Shangqiu', 'Xining', 'Zhongshan', 'Wuhu', "Huai'an", 'Yancheng', 'Xinxiang', 'Yichang', 'Changzhou', 'Kaifeng',
    'Xianyang', 'Datong', 'Mianyang', 'Luzhou', 'Zhanjiang', 'Zunyi', 'Hengyang', 'Taizhou', 'Guilin', 'Jinhua',

    // EUROPE (150 cities)
    // UK
    'London', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow', 'Liverpool', 'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh',
    'Leicester', 'Nottingham', 'Southampton', 'Portsmouth', 'Brighton', 'Plymouth', 'Reading', 'Bolton', 'Derby', 'Swansea',
    // Germany
    'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Dusseldorf', 'Dortmund', 'Essen', 'Leipzig',
    'Bremen', 'Dresden', 'Hanover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Mannheim',
    // France
    'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille',
    'Rennes', 'Reims', 'Le Havre', 'Saint-Etienne', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nimes', 'Villeurbanne',
    // Spain
    'Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Malaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao',
    'Alicante', 'Cordoba', 'Valladolid', 'Vigo', 'Gijon', 'Granada', 'Vitoria-Gasteiz', 'Elche', 'Oviedo', 'Santa Cruz de Tenerife',
    // Italy
    'Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania',
    'Venice', 'Verona', 'Messina', 'Padua', 'Trieste', 'Brescia', 'Parma', 'Prato', 'Taranto', 'Modena',
    // Netherlands
    'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen',
    // Other Europe
    'Brussels', 'Antwerp', 'Ghent', 'Vienna', 'Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Copenhagen',
    'Aarhus', 'Oslo', 'Bergen', 'Stockholm', 'Gothenburg', 'Malmo', 'Helsinki', 'Tampere', 'Turku', 'Dublin',
    'Cork', 'Athens', 'Thessaloniki', 'Lisbon', 'Porto', 'Warsaw', 'Krakow', 'Lodz', 'Wroclaw', 'Poznan',
    'Prague', 'Brno', 'Budapest', 'Bucharest', 'Sofia', 'Belgrade', 'Zagreb', 'Bratislava', 'Vilnius', 'Riga',

    // LATIN AMERICA (100 cities)
    // Brazil
    'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre',
    'Belém', 'Goiânia', 'Guarulhos', 'Campinas', 'São Luís', 'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Natal', 'Teresina',
    // Mexico
    'Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Zapopan', 'Mérida', 'San Luis Potosí',
    'Aguascalientes', 'Hermosillo', 'Saltillo', 'Mexicali', 'Culiacán', 'Chihuahua', 'Acapulco', 'Querétaro', 'Morelia', 'Toluca',
    // Argentina
    'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'San Miguel de Tucumán', 'Mar del Plata', 'Salta', 'Santa Fe', 'San Juan',
    // Colombia
    'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué',
    // Peru
    'Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Cusco', 'Huancayo', 'Tacna', 'Ica',
    // Chile
    'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco', 'Rancagua', 'Talca', 'Arica', 'Puerto Montt',
    // Other Latin America
    'Lima', 'Quito', 'Guayaquil', 'Caracas', 'Maracaibo', 'La Paz', 'Santa Cruz', 'Montevideo', 'Asunción', 'Panama City',
    'San José', 'Guatemala City', 'Tegucigalpa', 'San Salvador', 'Managua', 'Santo Domingo', 'Havana', 'Port-au-Prince', 'Kingston', 'San Juan',

    // ASIA (200 cities)
    // Japan
    'Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama',
    'Hiroshima', 'Sendai', 'Kitakyushu', 'Chiba', 'Sakai', 'Niigata', 'Hamamatsu', 'Kumamoto', 'Sagamihara', 'Shizuoka',
    // South Korea
    'Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon', 'Seongnam',
    'Goyang', 'Yongin', 'Bucheon', 'Ansan', 'Cheongju', 'Jeonju', 'Anyang', 'Pohang', 'Uijeongbu', 'Gimhae',
    // Indonesia
    'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Bekasi', 'Semarang', 'Palembang', 'Makassar', 'Tangerang', 'Depok',
    'Batam', 'Bogor', 'Pekanbaru', 'Bandar Lampung', 'Padang', 'Malang', 'Denpasar', 'Samarinda', 'Balikpapan', 'Tasikmalaya',
    // Philippines
    'Manila', 'Quezon City', 'Davao', 'Caloocan', 'Cebu', 'Zamboanga City', 'Antipolo', 'Pasig', 'Taguig', 'Cagayan de Oro',
    'Parañaque', 'Valenzuela', 'Las Piñas', 'Bacoor', 'General Santos', 'Makati', 'Dasmariñas', 'Bacolod', 'San Jose del Monte', 'Iloilo',
    // Vietnam
    'Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Bien Hoa', 'Hai Phong', 'Can Tho', 'Nha Trang', 'Hue', 'Da Lat', 'Vung Tau',
    // Thailand
    'Bangkok', 'Nonthaburi', 'Pak Kret', 'Hat Yai', 'Chiang Mai', 'Udon Thani', 'Khon Kaen', 'Nakhon Ratchasima', 'Surat Thani', 'Phuket',
    // Pakistan
    'Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Hyderabad', 'Peshawar', 'Quetta', 'Islamabad',
    'Sargodha', 'Sialkot', 'Bahawalpur', 'Sukkur', 'Jhang', 'Larkana', 'Sheikhupura', 'Gujrat', 'Mardan', 'Kasur',
    // Bangladesh
    'Dhaka', 'Chattogram', 'Khulna', 'Rajshahi', 'Sylhet', 'Rangpur', 'Barisal', 'Comilla', 'Narayanganj', 'Gazipur',
    // Malaysia
    'Kuala Lumpur', 'George Town', 'Ipoh', 'Shah Alam', 'Petaling Jaya', 'Johor Bahru', 'Malacca City', 'Kuching', 'Kota Kinabalu', 'Seremban',
    // Other Asia
    'Singapore', 'Hong Kong', 'Taipei', 'Taichung', 'Kaohsiung', 'Tainan', 'Macau', 'Ulaanbaatar', 'Bishkek', 'Almaty',
    'Tashkent', 'Astana', 'Dushanbe', 'Ashgabat', 'Kabul', 'Yangon', 'Naypyidaw', 'Phnom Penh', 'Vientiane', 'Colombo',
    'Kathmandu', 'Jerusalem', 'Tel Aviv', 'Amman', 'Beirut', 'Damascus', 'Baghdad', 'Kuwait City', 'Doha', 'Manama',
    'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Muscat', "Sana'a", 'Aden',

    // AFRICA (120 cities)
    // Egypt
    'Cairo', 'Alexandria', 'Giza', 'Port Said', 'Suez', 'Luxor', 'Aswan', 'Mansoura', 'Tanta', 'Asyut',
    // Nigeria
    'Lagos', 'Kano', 'Ibadan', 'Benin City', 'Port Harcourt', 'Kaduna', 'Maiduguri', 'Zaria', 'Aba', 'Jos',
    'Ilorin', 'Oyo', 'Enugu', 'Abeokuta', 'Abuja', 'Sokoto', 'Onitsha', 'Warri', 'Calabar', 'Katsina',
    // South Africa
    'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Nelspruit', 'Polokwane', 'Kimberley',
    // Ethiopia
    'Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Bahir Dar', 'Hawassa', 'Dessie', 'Jimma', 'Jijiga', 'Shashamane',
    // Kenya
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale', 'Garissa', 'Kakamega',
    //Tanzania
    'Dar es Salaam', 'Mwanza', 'Arusha', 'Dodoma', 'Mbeya', 'Morogoro', 'Tanga', 'Zanzibar City', 'Kigoma', 'Moshi',
    // Other Africa
    'Kinshasa', 'Luanda', 'Nairobi', 'Casablanca', 'Algiers', 'Khartoum', 'Abidjan', 'Dakar', 'Accra', 'Kampala',
    'Bamako', 'Lusaka', 'Kigali', 'Harare', 'Maputo', 'Yaoundé', 'Antananarivo', 'Douala', 'Ouagadougou', 'Conakry',
    "N'Djamena", 'Lomé', 'Cotonou', 'Niamey', 'Libreville', 'Brazzaville', 'Port Louis', 'Freetown', 'Monrovia', 'Nouakchott',
    'Bangui', 'Bujumbura', 'Windhoek', 'Gaborone', 'Maseru', 'Mbabane', 'Lilongwe', 'Blantyre', 'Port Said', 'Fez',
    'Marrakech', 'Rabat', 'Tangier', 'Agadir', 'Meknes', 'Oujda', 'Kenitra', 'Tétouan', 'Safi', 'El Jadida',

    // OCEANIA (50 cities)
    // Australia
    'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Wollongong', 'Logan City',
    'Geelong', 'Hobart', 'Townsville', 'Cairns', 'Darwin', 'Toowoomba', 'Ballarat', 'Bendigo', 'Mackay', 'Rockhampton',
    'Bundaberg', 'Launceston', 'Hervey Bay', 'Wagga Wagga', 'Coffs Harbour', 'Shepparton', 'Mildura', 'Port Macquarie', 'Dubbo', 'Tamworth',
    // New Zealand
    'Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Napier-Hastings', 'Dunedin', 'Palmerston North', 'Nelson', 'Rotorua',
    'New Plymouth', 'Whangarei', 'Invercargill', 'Whanganui', 'Gisborne', 'Timaru', 'Blenheim', 'Westport', 'Greymouth', 'Queenstown',

    // CANADA (50 cities)
    'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener',
    'London', 'Victoria', 'Halifax', 'Oshawa', 'Windsor', 'Saskatoon', 'Regina', "St. John's", 'Barrie', 'Kelowna',
    'Abbotsford', 'Sudbury', 'Kingston', 'Saguenay', 'Sherbrooke', 'Trois-Rivières', 'Moncton', 'Saint John', 'Thunder Bay', 'Kamloops',
    'Nanaimo', 'Brantford', 'Red Deer', 'Lethbridge', 'Saint-Jérôme', 'Chilliwack', 'Medicine Hat', 'Grande Prairie', 'Airdrie', 'Halton Hills',
    'Saint-Hyacinthe', 'Lac-Brome', 'Port Coquitlam', 'Fredericton', 'Charlottetown', 'Whitehorse', 'Yellowknife', 'Iqaluit', 'Fort McMurray', 'Prince George',

    // MIDDLE EAST (Additional 50 cities)
    'Tehran', 'Isfahan', 'Mashhad', 'Karaj', 'Shiraz', 'Tabriz', 'Qom', 'Ahvaz', 'Kermanshah', 'Urmia',
    'Zahedan', 'Rasht', 'Hamadan', 'Kerman', 'Yazd', 'Ardabil', 'Bandar Abbas', 'Arak', 'Eslamshahr', 'Zanjan',
    'Sanandaj', 'Qazvin', 'Khorramabad', 'Gorgan', 'Sari', 'Dezful', 'Sabzevar', 'Khomeini Shahr', 'Amol', 'Bojnurd',
    'Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Adana', 'Gaziantep', 'Konya', 'Antalya', 'Diyarbakir', 'Mersin',
    'Kayseri', 'Eskisehir', 'Urfa', 'Malatya', 'Erzurum', 'Van', 'Batman', 'Elazig', 'Denizli', 'Sivas',
];

export default WORLD_CITIES;
