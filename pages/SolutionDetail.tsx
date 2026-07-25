import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowRight, Award, Building2, CheckCircle2, Database, HardHat,
  Network, Radio, Server, ShieldCheck, Sun, Wind, Wrench, Zap,
} from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { getLangText } from '../utils/translation-helper';

type Solution = {
  name: string;
  eyebrow: string;
  headline: string;
  intro: string;
  image: string;
  accent: string;
  icon: React.ReactNode;
  metrics: { value: string; label: string }[];
  services: { title: string; description: string; icon: React.ReactNode }[];
  strengths: string[];
  applications: string[];
  seoDescription: string;
};

const getSolutions = (language: Language): Record<string, Solution> => ({
  telecom: {
    name: getLangText(language, { vi: 'Hạ tầng Viễn thông', en: 'Telecom Infrastructure', ko: '통신 인프라', ja: '通信インフラ', zh: '电信基础设施', de: 'Telekom-Infrastruktur' }),
    eyebrow: getLangText(language, { vi: 'VIỄN THÔNG & TRUYỀN DẪN', en: 'TELECOM & TRANSMISSION', ko: '통신 및 전송', ja: '通信・伝送', zh: '电信与传输', de: 'TELEKOM & ÜBERTRAGUNG' }),
    headline: getLangText(language, { vi: 'Kết nối ổn định cho mọi hạ tầng trọng yếu', en: 'Reliable Connectivity for Critical Infrastructure', ko: '핵심 인프라를 위한 안정적인 연결', ja: '重要インフラのための安定した接続', zh: '为关键基础设施提供稳定连接', de: 'Zuverlässige Konnektivität für kritische Infrastrukturen' }),
    intro: getLangText(language, { vi: 'CTC khảo sát, thiết kế và thi công đồng bộ hạ tầng truyền dẫn, mạng cáp quang ngoại vi và trạm phát sóng. Giải pháp được triển khai theo quy trình khép kín, phù hợp cho nhà mạng, cơ quan nhà nước và hệ thống chuyên dụng.', en: 'CTC surveys, designs, and constructs transmission infrastructure, OSP fiber networks, and BTS stations. Solutions are delivered turnkey for telecom carriers, government agencies, and specialized networks.', ko: 'CTC는 전송 인프라, 광케이블 네트워크 및 BTS 기지국을 종합 조사, 설계 및 시공합니다.', ja: 'CTCは伝送インフラ、光ファイバー網、BTS局の調査・設計・施工を行っています。', zh: 'CTC对传输基础设施、室外光缆网络及BTS基站进行勘察、设计与施工。', de: 'CTC plant und baut Übertragungsinfrastruktur, Glasfasernetze und BTS-Stationen.' }),
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=85&w=1920&auto=format&fit=crop', accent: '#0ea5e9', icon: <Radio size={26} />,
    metrics: [
      { value: '32+', label: getLangText(language, { vi: 'Năm kinh nghiệm', en: 'Years Experience', ko: '년 경력', ja: '年の実績', zh: '年经验', de: 'Jahre Erfahrung' }) },
      { value: '100+', label: getLangText(language, { vi: 'Công trình viễn thông', en: 'Telecom Projects', ko: '통신 프로젝트', ja: '通信工事実績', zh: '电信工程', de: 'Telekom-Projekte' }) },
      { value: '53+', label: getLangText(language, { vi: 'Cán bộ kỹ thuật chủ chốt', en: 'Key Tech Engineers', ko: '핵심 엔지니어', ja: '主要エンジニア', zh: '核心技术人员', de: 'Leitende Ingenieure' }) },
    ],
    services: [
      { title: getLangText(language, { vi: 'Mạng cáp quang OSP', en: 'OSP Fiber Network', ko: 'OSP 광케이블 네트워크', ja: 'OSP光ファイバー網', zh: 'OSP光缆网络', de: 'OSP-Glasfasernetz' }), description: getLangText(language, { vi: 'Khảo sát tuyến, thiết kế, kéo cáp, hàn nối, đo kiểm và hoàn công mạng ngoại vi.', en: 'Route survey, design, cable pulling, splicing, testing, and commissioning for OSP networks.', ko: '노선 조사, 설계, 케이블 포설, 접속, 측정 및 준공.', ja: 'ルート調査、設計、通線、融着、測定、完工。', zh: '线路勘察、设计、熔接、测试及竣工。', de: 'Routenvermessung, Planung, Verlegung, Spleißen und Abnahme.' }), icon: <Network /> },
      { title: getLangText(language, { vi: 'Trạm BTS/NodeB', en: 'BTS / NodeB Stations', ko: 'BTS / NodeB 기지국', ja: 'BTS / NodeB局', zh: 'BTS/NodeB基站', de: 'BTS / NodeB Stationen' }), description: getLangText(language, { vi: 'Xây lắp hạ tầng trạm, cột anten, nguồn điện, tiếp địa và tích hợp thiết bị.', en: 'Station construction, antenna towers, power systems, grounding, and equipment integration.', ko: '기지국 인프라, 안테나 철탑, 전원, 접지 및 장비 통합.', ja: '局舎インフラ、鉄塔、電源、接地、機器統合。', zh: '基站基础设施、天线铁塔、电源、接地与设备集成。', de: 'Bau von Stationen, Masten, Stromversorgung und Integration.' }), icon: <Radio /> },
      { title: getLangText(language, { vi: 'Mạng truyền dẫn Metro', en: 'Metro Transmission Network', ko: 'Metro 전송 네트워크', ja: 'Metro伝送網', zh: 'Metro传输网络', de: 'Metro-Übertragungsnetz' }), description: getLangText(language, { vi: 'Triển khai hạ tầng truyền dẫn dung lượng cao, bảo đảm khả năng mở rộng và dự phòng.', en: 'High-capacity transmission deployment ensuring scalability and redundancy.', ko: '확장성 및 리던던시를 보장하는 고용량 전송 인프라.', ja: '拡張性と冗長性を確保した大容量伝送インフラ。', zh: '部署大容量传输基础设施，确保可扩展性与冗余度。', de: 'Deployment kapazitätsstarker Übertragung mit Redundanz.' }), icon: <Database /> },
    ],
    strengths: [
      getLangText(language, { vi: 'Kinh nghiệm thực tế với mạng Metro Mobifone và VNPT Net', en: 'Proven track record with Mobifone and VNPT Net Metro networks', ko: 'Mobifone 및 VNPT Net Metro 네트워크 실적', ja: 'MobifoneおよびVNPT Net Metro網の実績', zh: 'Mobifone与VNPT Net Metro网络施工经验', de: 'Nachgewiesene Erfahrung mit Mobifone & VNPT Net Metro' }),
      getLangText(language, { vi: 'Năng lực thi công tuyến cáp quang chuyên dụng cho Bộ Công an', en: 'Capability to build dedicated fiber lines for Ministry of Public Security', ko: '공안부 전용 광케이블 구축 역량', ja: '公安省向け専用光線の構築能力', zh: '公安部专用光缆线路施工能力', de: 'Kapazität für spezialisierte Glasfaserleitungen' }),
      getLangText(language, { vi: 'Đội ngũ kỹ sư viễn thông, điện và xây dựng phối hợp đồng bộ', en: 'Synchronized team of telecom, electrical, and civil engineers', ko: '통신, 전력, 건설 엔지니어의 동기화된 팀', ja: '通信・電気・土木エンジニアの連携チーム', zh: '电信、电气与建筑工程师协同团队', de: 'Synchronisiertes Ingenieurteam' }),
      getLangText(language, { vi: 'Dịch vụ từ khảo sát, thiết kế đến vận hành và bảo trì', en: 'End-to-end service from survey & design to O&M', ko: '조사, 설계부터 운영 및 유지보수까지 일괄 서비스', ja: '調査・設計から運用・保守まで一貫サービス', zh: '从勘察设计到运维的全流程服务', de: 'End-to-End-Service von Vermessung bis O&M' }),
    ],
    applications: [
      getLangText(language, { vi: 'Nhà mạng viễn thông', en: 'Telecom Carriers', ko: '통신 사업자', ja: '通信キャリア', zh: '电信运营商', de: 'Telekom-Anbieter' }),
      getLangText(language, { vi: 'Cơ quan nhà nước', en: 'Government Agencies', ko: '정부 기관', ja: '政府機関', zh: '政府机关', de: 'Behörden' }),
      getLangText(language, { vi: 'Khu công nghiệp', en: 'Industrial Parks', ko: '산업 단지', ja: '工業団地', zh: '工业园区', de: 'Industrieparks' }),
      getLangText(language, { vi: 'Mạng chuyên dụng', en: 'Dedicated Networks', ko: '전용 네트워크', ja: '専用ネットワーク', zh: '专用网络', de: 'Spezialnetze' }),
    ],
    seoDescription: getLangText(language, { vi: 'Giải pháp hạ tầng viễn thông CTC: cáp quang OSP, trạm BTS/NodeB, mạng Metro, nguồn và tiếp địa cho nhà mạng và cơ quan nhà nước.', en: 'CTC telecom infrastructure solutions: OSP fiber, BTS/NodeB stations, Metro network, power and grounding for telecom carriers and government.', ko: 'CTC 통신 인프라 솔루션: OSP 광케이블, BTS/NodeB 기지국, Metro 네트워크, 전원 및 접지.', ja: 'CTC通信インフラソリューション：OSP光ファイバー、BTS/NodeB局、Metro網、電源および接地。', zh: 'CTC电信基础设施解决方案：OSP光缆、BTS/NodeB基站、Metro网络、电源及接地。', de: 'CTC Telekom-Infrastrukturlösungen: OSP-Glasfaser, BTS/NodeB-Stationen, Metro-Netzwerk, Stromversorgung und Erdung.' }),
  },
  solar: {
    name: getLangText(language, { vi: 'Điện Mặt Trời Solar', en: 'Solar Power Solutions', ko: '태양광 솔루션', ja: '太陽光ソリューション', zh: '光伏太阳能解决方案', de: 'Solarstrom-Lösungen' }),
    eyebrow: getLangText(language, { vi: 'NĂNG LƯỢNG TÁI TẠO', en: 'RENEWABLE ENERGY', ko: '신재생 에너지', ja: '再生可能エネルギー', zh: '可再生能源', de: 'ERNEUERBARE ENERGIEN' }),
    headline: getLangText(language, { vi: 'Biến mái nhà và quỹ đất thành nguồn năng lượng sạch', en: 'Turn Roofs and Land into Clean Energy Sources', ko: '지붕과 부지를 깨끗한 에너지원으로 전환', ja: '屋根や土地をクリーンエネルギー源に変換', zh: '将屋顶与土地转化为清洁能源', de: 'Verwandeln Sie Dächer & Flächen in saubere Energie' }),
    intro: getLangText(language, { vi: 'CTC cung cấp giải pháp EPC điện mặt trời cho hộ gia đình, thương mại và công nghiệp. Mỗi hệ thống được tính toán theo mặt bằng, phụ tải và mục tiêu đầu tư để tối ưu sản lượng, độ bền và hiệu quả vận hành dài hạn.', en: 'CTC provides turnkey Solar EPC solutions for residential, commercial, and industrial clients.', ko: 'CTC는 주택, 상업 및 산업용 태양광 EPC 솔루션을 제공합니다.', ja: 'CTCは住宅、商業、産業用太陽光EPCソリューションを提供します。', zh: 'CTC为户用、工商业客户提供光伏EPC一站式解决方案。', de: 'CTC bietet schlüsselfertige Solar-EPC-Lösungen für Gewerbe und Industrie.' }),
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=85&w=1920&auto=format&fit=crop', accent: '#f97316', icon: <Sun size={26} />,
    metrics: [
      { value: '500+', label: getLangText(language, { vi: 'Công trình toàn lĩnh vực', en: 'Total Projects', ko: '총 프로젝트', ja: '全実績', zh: '全领域工程', de: 'Gesamtprojekte' }) },
      { value: 'EPC', label: getLangText(language, { vi: 'Triển khai trọn gói', en: 'Turnkey Execution', ko: '턴키 실행', ja: '一括導入', zh: '全流程实施', de: 'Schlüsselfertige Ausführung' }) },
      { value: '24/7', label: getLangText(language, { vi: 'Theo dõi vận hành', en: 'O&M Monitoring', ko: '운영 모니터링', ja: '運用監視', zh: '运维监控', de: 'O&M Überwachung' }) },
    ],
    services: [
      { title: getLangText(language, { vi: 'Solar áp mái', en: 'Rooftop Solar', ko: '옥상 태양광', ja: '屋根設置型太陽光', zh: '屋顶光伏', de: 'Dach-Photovoltaik' }), description: getLangText(language, { vi: 'Giải pháp cho hộ gia đình, văn phòng và công trình thương mại.', en: 'Solutions for residential, offices, and commercial buildings.', ko: '주택, 사무실 및 상업용 건물 솔루션.', ja: '住宅、オフィス、商業ビル向けソリューション。', zh: '适用于住宅、办公楼及商业建筑。', de: 'Lösungen für Wohn-, Büro- und Gewerbegebäude.' }), icon: <Building2 /> },
      { title: getLangText(language, { vi: 'Solar C&I', en: 'C&I Solar Systems', ko: '산업용 C&I 태양광', ja: '産業用C&I太陽光', zh: '工商业光伏', de: 'Gewerbe-Photovoltaik' }), description: getLangText(language, { vi: 'Hệ thống cho nhà máy và khu công nghiệp, ưu tiên tự dùng và tối ưu chi phí điện.', en: 'Systems for factories and industrial parks optimizing self-consumption.', ko: '공장 및 산업단지용 자가소비 최적화 시스템.', ja: '工場や工業団地向け自家消費最適化システム。', zh: '适用于工厂和工业园区，优化自发自用与电费。', de: 'Systeme für Fabriken zur Eigenverbrauchsoptimierung.' }), icon: <Zap /> },
      { title: getLangText(language, { vi: 'Vận hành & bảo trì', en: 'O&M Services', ko: '운영 및 유지보수', ja: '運用 & 保守', zh: '运维与保养', de: 'Betrieb & Wartung' }), description: getLangText(language, { vi: 'Giám sát sản lượng, kiểm tra an toàn, vệ sinh và bảo trì phòng ngừa.', en: 'Yield monitoring, safety checks, cleaning, and preventive maintenance.', ko: '발전량 모니터링, 안전 점검, 청소 및 예방 정비.', ja: '発電量監視、安全点検、清掃、予防保守。', zh: '发电量监控、安全检查、清洗及预防性维护。', de: 'Ertragsüberwachung, Sicherheitsprüfungen und Wartung.' }), icon: <Wrench /> },
    ],
    strengths: [
      getLangText(language, { vi: 'Quy trình EPC khép kín từ khảo sát đến bàn giao', en: 'Closed-loop EPC process from survey to handover', ko: '조사부터 인도까지 턴키 EPC 프로세스', ja: '調査から引き渡しまで一貫EPCプロセス', zh: '从勘察到交付的全流程EPC', de: 'Schlüsselfertiger EPC-Prozess von Vermessung bis Übergabe' }),
      getLangText(language, { vi: 'Thiết kế theo phụ tải thực tế và điều kiện công trình', en: 'Customized design based on actual load profile', ko: '부하 프로필에 맞춘 맞춤형 설계', ja: '実際の負荷パターンに応じた最適設計', zh: '根据实际负荷与工程条件定制设计', de: 'Maßgeschneiderte Planung nach Lastprofil' }),
      getLangText(language, { vi: 'Tích hợp hệ thống điện, chống sét và giám sát', en: 'Integrated electrical, lightning, and monitoring systems', ko: '전력, 감전/접지 및 모니터링 통합', ja: '電気、避雷、監視システムの統合', zh: '集成电气、防雷及监控系统', de: 'Integrierte Elektrik-, Blitzschutz- & Überwachungssysteme' }),
      getLangText(language, { vi: 'Đồng hành vận hành và bảo trì sau đầu tư', en: 'Long-term post-investment O&M partnership', ko: '투자 후 장기 운영 파트너십', ja: '投資後の長期O&Mパートナーシップ', zh: '投资后的长期运维陪伴', de: 'Langfristige O&M-Partnerschaft nach der Investition' }),
    ],
    applications: [
      getLangText(language, { vi: 'Hộ gia đình', en: 'Residential Households', ko: '일반 주택', ja: '一般住宅', zh: '居民住户', de: 'Privathaushalte' }),
      getLangText(language, { vi: 'Nhà máy sản xuất', en: 'Manufacturing Factories', ko: '제조 공장', ja: '製造工場', zh: '生产工厂', de: 'Produktionsstätten' }),
      getLangText(language, { vi: 'Kho vận', en: 'Logistics Warehouses', ko: '물류 창고', ja: '物流倉庫', zh: '物流仓库', de: 'Logistiklager' }),
      getLangText(language, { vi: 'Tòa nhà thương mại', en: 'Commercial Buildings', ko: '상업용 빌딩', ja: '商業ビル', zh: '商业大楼', de: 'Gewerbeimmobilien' }),
    ],
    seoDescription: getLangText(language, { vi: 'Giải pháp EPC điện mặt trời CTC cho hộ gia đình, nhà máy và khu công nghiệp; tư vấn, thiết kế, thi công, vận hành và bảo trì.', en: 'CTC Solar EPC solutions for residential, factories, and industrial parks; consulting, design, construction, O&M.', ko: '주택, 공장 및 산업 단지를 위한 CTC 태양광 EPC 솔루션.', ja: '住宅、工場、工業団地向けのCTC太陽光EPCソリューション。', zh: 'CTC面向户用、工厂及工业园区的光伏EPC解决方案。', de: 'CTC Solar-EPC-Lösungen für Gewerbe und Industrie.' }),
  },
  wind: {
    name: getLangText(language, { vi: 'Điện Gió Wind Power', en: 'Wind Power Solutions', ko: '풍력 발전 솔루션', ja: '風力発電ソリューション', zh: '风力发电解决方案', de: 'Windkraft-Lösungen' }),
    eyebrow: getLangText(language, { vi: 'NĂNG LƯỢNG TÁI TẠO', en: 'RENEWABLE ENERGY', ko: '신재생 에너지', ja: '再生可能エネルギー', zh: '可再生能源', de: 'ERNEUERBARE ENERGIEN' }),
    headline: getLangText(language, { vi: 'Hạ tầng đồng bộ cho dự án điện gió quy mô lớn', en: 'Synchronized Infrastructure for Utility-Scale Wind Farms', ko: '대규모 풍력 단지를 위한 동기화된 인프라', ja: '大規模風力発電向け統合インフラ', zh: '为大型风电项目提供同步基础设施', de: 'Infrastruktur für Windparks im Versorgermaßstab' }),
    intro: getLangText(language, { vi: 'CTC tham gia xây dựng hạ tầng điện gió từ nền móng, đường nội bộ, hệ thống cáp đến trạm biến áp và đấu nối. Năng lực thực tế được tích lũy qua các dự án tại khu vực miền Trung, đặc biệt ở Quảng Trị.', en: 'CTC participates in wind farm construction from foundations, internal roads, cabling to 110kV substations.', ko: 'CTC는 풍력 기초, 진입로, 집전 케이블 및 110kV 변전소를 시공합니다.', ja: 'CTCは風力基礎、アクセス道路、集電ケーブル、110kV変電所を構築します。', zh: 'CTC参与风电基础、道路、集电线路及110kV变电站施工。', de: 'CTC baut Windpark-Fundamente, Zufahrtswege & 110kV-Umspannwerke.' }),
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=85&w=1920&auto=format&fit=crop', accent: '#14b8a6', icon: <Wind size={26} />,
    metrics: [
      { value: '3', label: getLangText(language, { vi: 'Dự án điện gió tiêu biểu', en: 'Major Wind Farms', ko: '대표 풍력 프로젝트', ja: '主な風力実績', zh: '代表性风电项目', de: 'Haupt-Windparkprojekte' }) },
      { value: '110kV', label: getLangText(language, { vi: 'Năng lực đấu nối', en: 'Grid Connection', ko: '전력망 연계 역량', ja: '系統連系能力', zh: '并网能力', de: 'Netzanschlusskapazität' }) },
      { value: 'EPC', label: getLangText(language, { vi: 'Phối hợp đa hạng mục', en: 'Multi-discipline EPC', ko: '다분야 EPC', ja: '多分野EPC', zh: '多领域EPC', de: 'Interdisziplinäres EPC' }) },
    ],
    services: [
      { title: getLangText(language, { vi: 'Hạ tầng công trường', en: 'Site Infrastructure', ko: '현장 인프라', ja: '現場インフラ', zh: '现场基础设施', de: 'Baustelleninfrastruktur' }), description: getLangText(language, { vi: 'Đường công vụ, bãi lắp ráp và các hạng mục phụ trợ phục vụ thi công.', en: 'Access roads, assembly yards, and auxiliary construction facilities.', ko: '진입 도로, 조립 야드 및 부대 시설.', ja: 'アクセス道路、クレーンヤード、仮設設備。', zh: '施工道路、吊装场地及配套设施。', de: 'Zufahrtswege, Kranstellflächen & Hilfseinrichtungen.' }), icon: <HardHat /> },
      { title: getLangText(language, { vi: 'Móng trụ & cáp nội bộ', en: 'Foundations & Cables', ko: '기초 및 집전 케이블', ja: '基礎 & 内部ケーブル', zh: '风机基础与集电线路', de: 'Fundamente & Kabel' }), description: getLangText(language, { vi: 'Thi công kết cấu móng, hệ thống cáp thu gom và tiếp địa an toàn.', en: 'Turbine foundation structures, collector cabling, and safety grounding.', ko: '풍기 기초 구조물, 케이블 집전망 및 접지.', ja: '風車基礎構造、集電ケーブル網、接地。', zh: '风机基础结构、集电缆线及安全接地。', de: 'Fundamentbau, Kabelnetze & Erdung.' }), icon: <Wind /> },
      { title: getLangText(language, { vi: 'Đấu nối hệ thống điện', en: 'Grid Connection System', ko: '전력망 계통 연계', ja: '系統連系システム', zh: '电网并网系统', de: 'Netzanschluss-System' }), description: getLangText(language, { vi: 'Trạm biến áp, đường dây và phối hợp hệ thống điều khiển giám sát.', en: 'Substations, transmission lines, and SCADA control coordination.', ko: '변전소, 송전선 및 SCADA 제어 연계.', ja: '変電所、送電線、SCADA制御連携。', zh: '变电站、输电线路及SCADA监控协调。', de: 'Umspannwerke, Leitungen & SCADA-Einbindung.' }), icon: <Zap /> },
    ],
    strengths: [
      getLangText(language, { vi: 'Kinh nghiệm tại Hướng Hiệp, Hướng Linh và Hướng Linh 4', en: 'Proven experience at Huong Hiep, Huong Linh, and Huong Linh 4', ko: 'Huong Hiep, Huong Linh 풍력 현장 실적', ja: 'Huong Hiep, Huong Linh風力プロジェクトの実績', zh: '向协、向灵风电项目施工经验', de: 'Erfahrung bei Huong Hiep & Huong Linh Windparks' }),
      getLangText(language, { vi: 'Khả năng phối hợp xây dựng, điện và viễn thông', en: 'Cross-functional execution: Civil, Power, & Telecom', ko: '토목, 전력, 통신 융합 시공 역량', ja: '土木・電気・通信の統合施工能力', zh: '土木、电气与通信协同施工能力', de: 'Interdisziplinäre Ausführung: Bau, Strom & Telekom' }),
      getLangText(language, { vi: 'Kiểm soát an toàn trong điều kiện địa hình phức tạp', en: 'Rigorous safety control in challenging mountainous terrains', ko: '험준한 산악 지형에서의 철저한 안전 관리', ja: '山岳地帯での厳格な me 安全管理', zh: '复杂山地地形下的严格安全控制', de: 'Strikte Sicherheitskontrolle in schwierigem Gelände' }),
      getLangText(language, { vi: 'Tổ chức thi công theo tiến độ tổng thể của dự án', en: 'Timeline management synchronized with overall master plan', ko: '마스터 플랜과 동기화된 공정 관리', ja: '全体計画と同期した工程管理', zh: '按照总体进度计划组织高效施工', de: 'Terminplanung synchronisiert mit Gesamt-Masterplan' }),
    ],
    applications: [
      getLangText(language, { vi: 'Trang trại điện gió trên bờ', en: 'Onshore Wind Farms', ko: '육상 풍력 단지', ja: '陸上風力発電所', zh: '陆上风电场', de: 'Onshore-Windparks' }),
      getLangText(language, { vi: 'Trạm thu gom', en: 'Collector Substations', ko: '집전 변전소', ja: '集電変電所', zh: '汇集站', de: 'Sammelumspannwerke' }),
      getLangText(language, { vi: 'Trạm biến áp 110kV', en: '110kV Substations', ko: '110kV 변전소', ja: '110kV変電所', zh: '110kV变电站', de: '110kV-Umspannwerke' }),
      getLangText(language, { vi: 'Hệ thống SCADA', en: 'SCADA Systems', ko: 'SCADA 시스템', ja: 'SCADAシステム', zh: 'SCADA系统', de: 'SCADA-Systeme' }),
    ],
    seoDescription: getLangText(language, { vi: 'Giải pháp xây dựng hạ tầng điện gió CTC: móng trụ, đường công vụ, cáp nội bộ, trạm biến áp 110kV và đấu nối lưới.', en: 'CTC wind farm construction solutions: foundations, access roads, collector cabling, 110kV substations, and grid connection.', ko: '풍력 발전 인프라 시공 솔루션 CTC.', ja: '風力発電インフラ施工ソリューションCTC。', zh: 'CTC风电基础设施施工解决方案。', de: 'CTC Windpark-Bau-Lösungen.' }),
  },
  electrical: {
    name: getLangText(language, { vi: 'Đường Dây & Trạm Biến Áp', en: 'Power Lines & Substations', ko: '송전선 및 변전소', ja: '送電線・変電所', zh: '输电线路及变电站', de: 'Stromleitungen & Umspannwerke' }),
    eyebrow: getLangText(language, { vi: 'ĐIỆN LỰC & KỸ THUẬT', en: 'POWER GRID & ENGINEERING', ko: '전력 및 엔지니어링', ja: '電力・エンジニアリング', zh: '电力与工程', de: 'STROMNETZ & ENGINEERING' }),
    headline: getLangText(language, { vi: 'Hạ tầng truyền tải an toàn, tin cậy và sẵn sàng vận hành', en: 'Safe, Reliable & Operational Transmission Infrastructure', ko: '안전하고 신뢰할 수 있는 전력 송전 인프라', ja: '安全で信頼性の高い送電インフラ', zh: '安全、可靠、即刻就绪的输电基础设施', de: 'Sichere & zuverlässige Übertragungsinfrastruktur' }),
    intro: getLangText(language, { vi: 'CTC cung cấp giải pháp xây lắp đường dây trung – cao thế, trạm biến áp và các hệ thống điện phụ trợ. Phạm vi công việc được quản lý đồng bộ từ khảo sát hiện trường, tổ chức thi công đến thí nghiệm và bàn giao.', en: 'CTC constructs medium and high-voltage transmission lines and 110kV substations connected to the national grid.', ko: 'CTC는 국전망 연계 중/고압 송전선 및 110kV 변전소를 시공합니다.', ja: 'CTCは国家系統に接続された中・高圧送電線および110kV変電所を構築します。', zh: 'CTC建设连接国家电网的中高压输电线路及110kV变电站。', de: 'CTC baut Mittel- und Hochspannungsleitungen sowie 110kV-Umspannwerke.' }),
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=85&w=1920&auto=format&fit=crop', accent: '#eab308', icon: <Zap size={26} />,
    metrics: [
      { value: '110kV', label: getLangText(language, { vi: 'Cấp điện áp tiêu biểu', en: 'Voltage Level', ko: '전압 등급', ja: '電圧等級', zh: '典型电压等级', de: 'Spannungsebene' }) },
      { value: '02', label: getLangText(language, { vi: 'Chứng chỉ năng lực', en: 'Grade I Certificates', ko: '1등급 자격', ja: '1級資格', zh: '一级资质证书', de: 'Klasse-I-Zertifikate' }) },
      { value: '32+', label: getLangText(language, { vi: 'Năm kinh nghiệm', en: 'Years Experience', ko: '년 경력', ja: '年の実績', zh: '年经验', de: 'Jahre Erfahrung' }) },
    ],
    services: [
      { title: getLangText(language, { vi: 'Đường dây tải điện', en: 'Transmission Lines', ko: '송전선 시공', ja: '送電線工事', zh: '输电线路', de: 'Übertragungsleitungen' }), description: getLangText(language, { vi: 'Xây lắp tuyến trung và cao thế, móng cột, kéo dây và hoàn thiện hành lang tuyến.', en: 'Medium/high voltage line construction, tower foundations, and stringing.', ko: '중/고압 노선 시공, 철탑 기초 및 전선 포설.', ja: '中・高圧線構築、鉄塔基礎、架線工事。', zh: '中高压线路建设、铁塔基础及拉线。', de: 'Bau von Mittel-/Hochspannungsleitungen & Masten.' }), icon: <Zap /> },
      { title: getLangText(language, { vi: 'Trạm biến áp', en: 'Substations EPC', ko: '변전소 EPC', ja: '変電所EPC', zh: '变电站EPC', de: 'Umspannwerke EPC' }), description: getLangText(language, { vi: 'Thi công phần xây dựng, lắp đặt thiết bị, cáp lực và hệ thống điều khiển.', en: 'Civil works, equipment installation, power cabling, and control systems.', ko: '토목 공사, 장비 설치, 전력 케이블 및 제어 시스템.', ja: '土木工事、機器設置、電力ケーブル、制御システム。', zh: '土建施工、设备安装、电力电缆及控制系统。', de: 'Tiefbau, Geräteinstallation, Leistungskabel & Steuerung.' }), icon: <Building2 /> },
      { title: getLangText(language, { vi: 'Nguồn & an toàn điện', en: 'Power Auxiliary & Safety', ko: '전원 보조 및 안전', ja: '電源補助・安全', zh: '电源辅助与电安全', de: 'Stromversorgung & Sicherheit' }), description: getLangText(language, { vi: 'Nguồn dự phòng UPS, tiếp địa, chống sét và kiểm tra an toàn hệ thống.', en: 'UPS backup, grounding, lightning protection, and safety testing.', ko: 'UPS 비상 전원, 접지, 피뢰 및 안전 검사.', ja: 'UPSバックアップ電源、接地、避雷、安全試験。', zh: 'UPS备用电源、接地、防雷及安全检测。', de: 'USV-Backup, Erdung, Blitzschutz & Sicherheitstests.' }), icon: <ShieldCheck /> },
    ],
    strengths: [
      getLangText(language, { vi: 'Năng lực triển khai trạm biến áp 110kV', en: 'Grade I capability for 110kV substations', ko: '110kV 변전소 1등급 구축 역량', ja: '110kV変電所の1級構築能力', zh: '110kV变电站一级施工能力', de: 'Klasse-I-Kapazität für 110kV-Umspannwerke' }),
      getLangText(language, { vi: 'Đội ngũ kỹ sư điện và xây dựng giàu kinh nghiệm', en: 'Seasoned team of electrical and civil engineers', ko: '풍부한 경험의 전력 및 토목 엔지니어 팀', ja: '経験豊富な電気・土木エンジニアチーム', zh: '经验丰富的电气与土木工程师团队', de: 'Erfahrenes Team aus Elektro- und Bauingenieuren' }),
      getLangText(language, { vi: 'Kiểm soát chất lượng và an toàn theo từng hạng mục', en: 'Strict itemized quality and safety inspection', ko: '항목별 엄격한 품질 및 안전 점검', ja: '項目ごとの厳格な品質・安全検査', zh: '按分项进行严格的质量与安全检查', de: 'Strikte Qualitäts- und Sicherheitskontrolle' }),
      getLangText(language, { vi: 'Tích hợp nguồn, tiếp địa, chống sét và giám sát', en: 'Seamless integration of power, grounding, & SCADA', ko: '전원, 접지, 피뢰 및 SCADA 통합', ja: '電源、接地、避雷、SCADAのシームレス統合', zh: '无缝集成电源、接地、防雷及监控', de: 'Nahtlose Integration von Strom, Erdung & SCADA' }),
    ],
    applications: [
      getLangText(language, { vi: 'Nhà máy điện', en: 'Power Plants', ko: '발전소', ja: '発電所', zh: '发电厂', de: 'Kraftwerke' }),
      getLangText(language, { vi: 'Khu công nghiệp', en: 'Industrial Parks', ko: '산업 단지', ja: '工業団地', zh: '工业园区', de: 'Industrieparks' }),
      getLangText(language, { vi: 'Hạ tầng đô thị', en: 'Urban Infrastructure', ko: '도시 인프라', ja: '都市インフラ', zh: '城市基础设施', de: 'Städtische Infrastruktur' }),
      getLangText(language, { vi: 'Công trình trọng yếu', en: 'Critical Facilities', ko: '핵심 시설', ja: '重要施設', zh: '关键设施', de: 'Kritische Einrichtungen' }),
    ],
    seoDescription: getLangText(language, { vi: 'CTC xây lắp đường dây tải điện, trạm biến áp 110kV, nguồn dự phòng, tiếp địa và chống sét cho dự án công nghiệp và năng lượng.', en: 'CTC power lines & 110kV substations construction, backup power, grounding, and lightning protection.', ko: '110kV 변전소 및 송전선 시공 CTC.', ja: '110kV変電所および送電線施工CTC。', zh: '110kV变电站与输电线路施工CTC。', de: '110kV Umspannwerke & Stromleitungen Bau CTC.' }),
  },
  datacenter: {
    name: getLangText(language, { vi: 'Data Center & CNTT', en: 'Data Center & IT Infrastructure', ko: '데이터 센터 및 IT 인프라', ja: 'データセンター & ITインフラ', zh: '数据中心与IT基础设施', de: 'Rechenzentrum & IT' }),
    eyebrow: getLangText(language, { vi: 'HẠ TẦNG SỐ', en: 'DIGITAL INFRASTRUCTURE', ko: '디지털 인프라', ja: 'デジタルインフラ', zh: '数字基础设施', de: 'DIGITALE INFRASTRUKTUR' }),
    headline: getLangText(language, { vi: 'Nền tảng số bền vững cho hoạt động liên tục', en: 'Sustainable Digital Platform for Continuous Operation', ko: '지속 가능한 디지털 플랫폼', ja: '持続可能なデジタルプラットフォーム', zh: '为持续运营打造的永续数字平台', de: 'Nachhaltige digitale Plattform für Dauerbetrieb' }),
    intro: getLangText(language, { vi: 'CTC thiết kế và tích hợp hạ tầng Data Center, mạng doanh nghiệp, camera và hệ thống thông minh. Giải pháp cân bằng giữa tính sẵn sàng, an toàn, khả năng mở rộng và hiệu quả vận hành.', en: 'CTC designs and builds Tier III standard Data Centers, enterprise networks, and AI security systems.', ko: 'CTC는 Tier III 표준 데이터 센터 및 기업 네트워크를 설계 및 구축합니다.', ja: 'CTCはTier III規格データセンターおよび企業ネットワークを設計・構築します。', zh: 'CTC设计并建设Tier III标准数据中心与企业网络。', de: 'CTC plant und baut Tier III Rechenzentren und Netzwerke.' }),
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=85&w=1920&auto=format&fit=crop', accent: '#8b5cf6', icon: <Server size={26} />,
    metrics: [
      { value: 'Tier III', label: getLangText(language, { vi: 'Định hướng tiêu chuẩn', en: 'Target Standard', ko: '목표 표준', ja: '目標規格', zh: '目标标准', de: 'Zielstandard' }) },
      { value: '24/7', label: getLangText(language, { vi: 'Giám sát hệ thống', en: '24/7 Monitoring', ko: '24/7 시스템 모니터링', ja: '24/7システム監視', zh: '24/7系统监控', de: '24/7 Überwachung' }) },
      { value: '53+', label: getLangText(language, { vi: 'Nhân sự kỹ thuật chủ chốt', en: 'Key Tech Engineers', ko: '핵심 엔지니어', ja: '主要エンジニア', zh: '核心技术人员', de: 'Leitende Ingenieure' }) },
    ],
    services: [
      { title: getLangText(language, { vi: 'Hạ tầng Data Center', en: 'Data Center Infrastructure', ko: '데이터 센터 인프라', ja: 'データセンターインフラ', zh: '数据中心基础设施', de: 'Rechenzentrumsinfrastruktur' }), description: getLangText(language, { vi: 'Không gian máy chủ, nguồn, làm mát chính xác, giám sát và phòng cháy chữa cháy.', en: 'Server room space, power, precision cooling, monitoring, and fire suppression.', ko: '서버 룸, 전원, 정밀 냉각, 모니터링 및 소방 시스템.', ja: 'サーバー室、電源、精密空調、監視、防災。', zh: '服务器机房、电源、精密空调、监控与消防。', de: 'Serverraum, Strom, Präzisionskühlung & Brandschutz.' }), icon: <Server /> },
      { title: getLangText(language, { vi: 'Mạng & bảo mật', en: 'Network & Security', ko: '네트워크 및 보안', ja: 'ネットワーク & セキュリティ', zh: '网络与安全', de: 'Netzwerk & Sicherheit' }), description: getLangText(language, { vi: 'Mạng LAN/WAN, cáp cấu trúc, phân vùng và giải pháp bảo vệ hạ tầng.', en: 'LAN/WAN, structured cabling, segmentation, and perimeter defense.', ko: 'LAN/WAN, 구조화된 케이블, 구역화 및 인프라 보안.', ja: 'LAN/WAN、構造化配線、セグメンテーション、セキュリティ。', zh: 'LAN/WAN、结构化布线、网络分层及基础设施防护。', de: 'LAN/WAN, verkabelte Infrastruktur & Sicherheit.' }), icon: <Network /> },
      { title: getLangText(language, { vi: 'Hệ thống thông minh', en: 'Smart Systems & AI', ko: '스마트 시스템 및 AI', ja: 'スマートシステム & AI', zh: '智能系统与AI', de: 'Smart Systems & KI' }), description: getLangText(language, { vi: 'Camera, kiểm soát ra vào và nền tảng giám sát tập trung.', en: 'CCTV cameras, access control, and centralized management platforms.', ko: 'CCTV, 출입 통제 및 중앙 집중식 관리 플랫폼.', ja: 'CCTVカメラ、入退室管理、一元管理プラットフォーム。', zh: 'CCTV监控、门禁控制及集中化管理平台。', de: 'Kameras, Zutrittskontrolle & zentrale Verwaltung.' }), icon: <Database /> },
    ],
    strengths: [
      getLangText(language, { vi: 'Thiết kế hạ tầng theo định hướng Tier III', en: 'Tier III standard architecture design', ko: 'Tier III 표준 아키텍처 설계', ja: 'Tier III規格のアーキテクチャ設計', zh: '基于Tier III标准的架构设计', de: 'Architekturdesign nach Tier III Standard' }),
      getLangText(language, { vi: 'Tích hợp điện, làm mát, mạng và an ninh', en: 'Full integration of power, cooling, net, & security', ko: '전원, 냉각, 네트워크 및 보안의 완전 통합', ja: '電源・空調・ネット・セキュリティの完全統合', zh: '电源、空调、网络与安防全方位集成', de: 'Vollständige Integration von Strom, Kühlung & Netz' }),
      getLangText(language, { vi: 'Kiến trúc có dự phòng và khả năng mở rộng', en: 'Redundant and highly scalable architecture', ko: '리던던시 및 높은 확장성을 갖춘 아키텍처', ja: '冗長性と高拡張性を備えたアーキテクチャ', zh: '具备冗余性与高可扩展性的架构', de: 'Redundante und hochskalierbare Architektur' }),
      getLangText(language, { vi: 'Dịch vụ vận hành, giám sát và bảo trì', en: 'Ongoing O&M, monitoring, and maintenance services', ko: '지속적인 O&M, 모니터링 및 유지보수 서비스', ja: '継続的なO&M、監視、保守サービス', zh: '持续的运维、监控与保养服务', de: 'Laufende O&M-, Überwachungs- & Wartungsdienste' }),
    ],
    applications: [
      getLangText(language, { vi: 'Trung tâm dữ liệu', en: 'Data Centers', ko: '데이터 센터', ja: 'データセンター', zh: '数据中心', de: 'Rechenzentren' }),
      getLangText(language, { vi: 'Doanh nghiệp', en: 'Enterprises', ko: '기업', ja: '企業', zh: '企业', de: 'Unternehmen' }),
      getLangText(language, { vi: 'Cơ quan nhà nước', en: 'Government Agencies', ko: '정부 기관', ja: '政府機関', zh: '政府机关', de: 'Behörden' }),
      getLangText(language, { vi: 'Trung tâm điều hành', en: 'Command Centers', ko: '통제 센터', ja: '統制センター', zh: '指挥控制中心', de: 'Leitstände' }),
    ],
    seoDescription: getLangText(language, { vi: 'Giải pháp Data Center và CNTT CTC: nguồn, làm mát, mạng, bảo mật, camera và hệ thống giám sát tích hợp.', en: 'CTC Data Center & IT solutions: power, cooling, networking, security, CCTV, and integrated monitoring.', ko: '데이터 센터 및 IT 솔루션 CTC.', ja: 'データセンター & ITソリューションCTC。', zh: '数据中心与IT解决方案CTC。', de: 'Rechenzentrum & IT Lösungen CTC.' }),
  },
  construction: {
    name: getLangText(language, { vi: 'Xây Dựng Dân Dụng & Công Nghiệp', en: 'Civil & Industrial Construction', ko: '민간 및 산업 건설', ja: '土木・産業建設', zh: '民用与工业建筑', de: 'Bau- & Industriebau' }),
    eyebrow: getLangText(language, { vi: 'XÂY DỰNG KĨ THUẬT', en: 'TECHNICAL CONSTRUCTION', ko: '기술 건설', ja: '技術建設', zh: '工程建设', de: 'TECHNISCHER BAU' }),
    headline: getLangText(language, { vi: 'Kiến tạo công trình bền vững từ thiết kế đến bàn giao', en: 'Building Sustainable Works from Design to Handover', ko: '설계부터 인도까지 지속 가능한 건축물 조성', ja: '設計から引き渡しまで持続可能な構造物を構築', zh: '从设计到交付建造可持续建筑工程', de: 'Nachhaltige Bauwerke von der Planung bis zur Übergabe' }),
    intro: getLangText(language, { vi: 'CTC thi công công trình dân dụng, nhà xưởng công nghiệp và hạ tầng kỹ thuật đi kèm các dự án viễn thông, điện và năng lượng. Mô hình Design-Build/EPC giúp thống nhất trách nhiệm, chất lượng và tiến độ.', en: 'CTC constructs civil works, industrial factories, and technical infrastructure for telecom and energy projects.', ko: 'CTC는 통신 및 에너지 프로젝트를 위한 민간 구조물, 공장 및 인프라를 시공합니다.', ja: 'CTCは通信・エネルギープロジェクト向けの土木構造物、工場、インフラを施工します。', zh: 'CTC建设用于电信与能源项目的民用工程、工业厂房及配套基础设施。', de: 'CTC baut Zivilbauten, Industriefabriken und Infrastruktur.' }),
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?q=85&w=1920&auto=format&fit=crop', accent: '#64748b', icon: <Building2 size={26} />,
    metrics: [
      { value: '500+', label: getLangText(language, { vi: 'Công trình toàn lĩnh vực', en: 'Completed Projects', ko: '완료된 프로젝트', ja: '完了実績', zh: '完成工程', de: 'Abgeschlossene Projekte' }) },
      { value: 'EPC', label: getLangText(language, { vi: 'Tổng thầu trọn gói', en: 'General Contractor', ko: '총괄 계약자', ja: '元請け', zh: '总承包商', de: 'Generalunternehmer' }) },
      { value: '02', label: getLangText(language, { vi: 'Chứng chỉ năng lực', en: 'Grade I Certificates', ko: '1등급 자격', ja: '1級資格', zh: '一级资质证书', de: 'Klasse-I-Zertifikate' }) },
    ],
    services: [
      { title: getLangText(language, { vi: 'Công trình công nghiệp', en: 'Industrial Works', ko: '산업 시설', ja: '産業施設', zh: '工业工程', de: 'Industriebauten' }), description: getLangText(language, { vi: 'Nhà xưởng, kho, nền móng thiết bị và hạ tầng phục vụ sản xuất.', en: 'Factories, warehouses, heavy foundations, and production infrastructure.', ko: '공장, 창고, 중장비 기초 및 생산 인프라.', ja: '工場、倉庫、重機基礎、生産インフラ。', zh: '厂房、仓库、重型设备基础及生产基础设施。', de: 'Fabriken, Lagerhallen & Fundamente.' }), icon: <Building2 /> },
      { title: getLangText(language, { vi: 'Công trình dân dụng', en: 'Civil Works', ko: '민간 건축물', ja: '土木・建築構造物', zh: '民用工程', de: 'Zivilbauten' }), description: getLangText(language, { vi: 'Thi công kết cấu, hoàn thiện và hệ thống kỹ thuật đồng bộ.', en: 'Structural construction, finishing, and synchronized MEP systems.', ko: '골조 시공, 마감 및 MEP 시스템.', ja: '躯体工事、仕上げ、MEPシステム。', zh: '主体结构施工、装修及MEP机电系统。', de: 'Rohbau, Ausbau & MEP-Systeme.' }), icon: <HardHat /> },
      { title: getLangText(language, { vi: 'M&E và hạ tầng kỹ thuật', en: 'MEP & Technical Infra', ko: 'MEP 및 기술 인프라', ja: 'MEP & 技術インフラ', zh: 'MEP与技术基础设施', de: 'MEP & Technische Infra' }), description: getLangText(language, { vi: 'Hệ thống điện, cấp thoát nước, phòng cháy và hạ tầng ngoài nhà.', en: 'Electrical, plumbing, fire protection, and site infrastructure.', ko: '전력, 급배수, 소방 및 배후 인프라.', ja: '電気、給排水、防災、屋外インフラ。', zh: '电气、给排水、消防及室外配套。', de: 'Elektrik, Sanitär, Brandschutz & Tiefbau.' }), icon: <Wrench /> },
    ],
    strengths: [
      getLangText(language, { vi: 'Quản lý một đầu mối theo mô hình EPC/Design-Build', en: 'Single-point management under EPC / Design-Build', ko: 'EPC/Design-Build 모델의 단일 창구 관리', ja: 'EPC/Design-Buildモデルの単一窓口管理', zh: 'EPC/Design-Build模式下的单一接口管理', de: 'Single-Point-Management unter EPC / Design-Build' }),
      getLangText(language, { vi: 'Phối hợp đa chuyên ngành tại công trường', en: 'Interdisciplinary coordination at construction sites', ko: '현장에서의 다분야 협업', ja: '現場での多分野連携', zh: '施工现场的多专业协同', de: 'Interdisziplinäre Koordination vor Ort' }),
      getLangText(language, { vi: 'Năng lực thi công công trình quốc phòng và hạ tầng trọng yếu', en: 'Capability for defense and critical infrastructure works', ko: '국방 및 핵심 인프라 공사 수행 역량', ja: '防衛および重要インフラ工事の施工能力', zh: '国防工程与关键基础设施施工能力', de: 'Kapazität für Verteidigungs- & Schlüsselbauten' }),
      getLangText(language, { vi: 'Cam kết chất lượng, an toàn và tiến độ', en: 'Commitment to Quality, Safety, and Schedule', ko: '품질, 안전 및 일정에 대한 약속', ja: '品質、安全、納期の徹底', zh: '质量、安全与进度的坚定承诺', de: 'Verpflichtung zu Qualität, Sicherheit & Terminen' }),
    ],
    applications: [
      getLangText(language, { vi: 'Nhà xưởng & kho', en: 'Factories & Warehouses', ko: '공장 및 창고', ja: '工場・倉庫', zh: '厂房与仓库', de: 'Fabriken & Lager' }),
      getLangText(language, { vi: 'Công trình dân dụng', en: 'Civil Buildings', ko: '민간 건축물', ja: '土木・建築物', zh: '民用建筑', de: 'Zivilbauten' }),
      getLangText(language, { vi: 'Hạ tầng năng lượng', en: 'Energy Infrastructure', ko: '에너지 인프라', ja: 'エネルギーインフラ', zh: '能源基础设施', de: 'Energieinfrastruktur' }),
      getLangText(language, { vi: 'Công trình quốc phòng', en: 'Defense Facilities', ko: '국방 시설', ja: '防衛施設', zh: '国防设施', de: 'Verteidigungseinrichtungen' }),
    ],
    seoDescription: getLangText(language, { vi: 'Giải pháp xây dựng dân dụng và công nghiệp CTC: nhà xưởng, hạ tầng kỹ thuật, M&E và tổng thầu EPC/Design-Build.', en: 'CTC civil and industrial construction solutions: factories, infrastructure, MEP, EPC/Design-Build.', ko: '민간 및 산업 건설 솔루션 CTC.', ja: '土木・産業建設ソリューションCTC。', zh: '民用与工业建筑解决方案CTC。', de: 'Bau- & Industriebau-Lösungen CTC.' }),
  },
});

const SolutionDetail: React.FC = () => {
  const { slug = '' } = useParams();
  const { language } = useLanguage();
  const solution = getSolutions(language)[slug];
  if (!solution) return <Navigate to="/solutions" replace />;

  return (
    <div className="bg-white dark:bg-[#060d1d] text-slate-700 dark:text-slate-200">
      <SEO
        title={solution.name}
        description={solution.seoDescription}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: solution.name,
          description: solution.seoDescription,
          provider: {
            '@type': 'Organization',
            name: 'Công ty Cổ phần Xây lắp Bưu điện Miền Trung',
            telephone: '+84-915-059-666',
          },
          areaServed: 'Vietnam',
        }}
      />
      <section className="relative min-h-[620px] flex items-center overflow-hidden bg-slate-950 pt-28">
        <img src={solution.image} alt={solution.name} className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/25" />
        <div className="container mx-auto px-6 relative z-10 py-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-bold tracking-[.18em] text-white backdrop-blur-md" style={{ color: solution.accent }}>
              {solution.icon}
              {solution.eyebrow}
            </div>
            <h1 className="mt-7 text-4xl md:text-6xl font-black leading-tight text-white">
              {solution.name}
              <span className="block mt-2" style={{ color: solution.accent }}>
                {solution.headline}
              </span>
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-200">{solution.intro}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-bold text-white" style={{ backgroundColor: solution.accent }}>
                {getLangText(language, { vi: 'Trao đổi với kỹ sư', en: 'Talk to Engineers', ko: '엔지니어와 상담', ja: 'エンジニアに相談', zh: '与工程师沟通', de: 'Mit Ingenieuren sprechen' })} <ArrowRight size={18} />
              </Link>
              <a href="tel:0915059666" className="rounded-xl border border-white/30 px-6 py-3.5 font-bold text-white hover:bg-white/10">
                0915 059 666
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-5">
          {solution.metrics.map(item => (
            <div key={item.label} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-7">
              <div className="text-3xl font-black" style={{ color: solution.accent }}>{item.value}</div>
              <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-bold tracking-[.2em]" style={{ color: solution.accent }}>
            {getLangText(language, { vi: 'PHẠM VI GIẢI PHÁP', en: 'SOLUTION SCOPE', ko: '솔루션 범위', ja: 'ソリューション範囲', zh: '解决方案范围', de: 'LÖSUNGSUMFANG' })}
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
            {getLangText(language, { vi: 'Năng lực triển khai đồng bộ', en: 'Synchronous Deployment Capability', ko: '동기적 배포 역량', ja: '一貫した導入能力', zh: '协同部署能力', de: 'Synchronisiertes Einsatzpotenzial' })}
          </h2>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {solution.services.map(service => (
            <article key={service.title} className="rounded-3xl border border-slate-200 dark:border-white/10 p-7 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ backgroundColor: solution.accent }}>
                {service.icon}
              </div>
              <h3 className="mt-5 text-lg font-extrabold text-slate-900 dark:text-white">{service.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 dark:bg-slate-950/60 py-20">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-8">
          <div className="rounded-3xl bg-slate-900 p-8 md:p-10 text-white">
            <Award style={{ color: solution.accent }} />
            <h2 className="mt-5 text-2xl font-black">
              {getLangText(language, { vi: 'Vì sao chọn CTC?', en: 'Why Choose CTC?', ko: '왜 CTC를 선택해야 할까요?', ja: 'CTCが選ばれる理由', zh: '为什么选择CTC？', de: 'Warum CTC wählen?' })}
            </h2>
            <div className="mt-7 space-y-4">
              {solution.strengths.map(text => (
                <div key={text} className="flex gap-3 text-sm leading-6 text-slate-200">
                  <CheckCircle2 size={19} className="shrink-0 mt-0.5" style={{ color: solution.accent }} />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 md:p-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {getLangText(language, { vi: 'Ứng dụng tiêu biểu', en: 'Typical Applications', ko: '대표적 적용 분야', ja: '主な適用分野', zh: '典型应用', de: 'Typische Anwendungen' })}
            </h2>
            <div className="mt-7 grid sm:grid-cols-2 gap-4">
              {solution.applications.map(text => (
                <div key={text} className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-900 p-4 font-bold text-sm">
                  <CheckCircle2 size={18} style={{ color: solution.accent }} />
                  {text}
                </div>
              ))}
            </div>
            <p className="mt-7 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {getLangText(language, { vi: 'Mỗi dự án được khảo sát và thiết kế theo điều kiện thực tế. CTC cung cấp hồ sơ kỹ thuật, kế hoạch triển khai và phương án vận hành phù hợp trước khi thi công.', en: 'Each project is surveyed and designed according to actual conditions. CTC provides technical documents, deployment plans, and operation procedures prior to construction.', ko: '각 프로젝트는 실제 조건에 맞춰 조사 및 설계됩니다. CTC는 시공 전 기술 문서, 배포 계획 및 운영 절차를 제공합니다.', ja: '各プロジェクトは実際の条件に合わせて調査・設計されます。CTCは施工前に技術文書、導入計画、運用手順を提供します。', zh: '每个项目均根据实际条件进行勘察和设计。CTC在施工前提供完整的技术文档、实施计划和运营方案。', de: 'Jedes Projekt wird nach den tatsächlichen Bedingungen vermessen und geplant.' })}
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="rounded-3xl px-8 py-12 md:p-14 text-center text-white" style={{ background: `linear-gradient(135deg, ${solution.accent}, #0f172a)` }}>
          <h2 className="text-3xl font-black">
            {getLangText(language, { vi: 'Bạn đang chuẩn bị một dự án?', en: 'Are you preparing a project?', ko: '프로젝트를 준비 중이신가요?', ja: 'プロジェクトのご準備中ですか？', zh: '您正在筹备项目吗？', de: 'Bereiten Sie ein Projekt vor?' })}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            {getLangText(language, { vi: 'Gửi yêu cầu để đội ngũ CTC khảo sát nhu cầu, tư vấn phạm vi công việc và đề xuất phương án phù hợp.', en: 'Submit a request so the CTC team can survey your needs and propose a suitable solution.', ko: '요청을 제출하시면 CTC 팀이 니즈를 조사하고 적합한 솔루션을 제안해 드립니다.', ja: 'リクエストを送信していただくと、CTCチームがニーズを調査し最適なソリューションをご提案いたします。', zh: '提交您的需求，CTC团队将即刻开展需求勘察并提供合适方案。', de: 'Senden Sie eine Anfrage, damit das CTC-Team Ihren Bedarf prüft.' })}
          </p>
          <Link to="/contact" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-slate-900">
            {getLangText(language, { vi: 'Nhận tư vấn giải pháp', en: 'Get Solution Advice', ko: '솔루션 상담 받기', ja: 'ソリューション相談を受ける', zh: '获取方案咨询', de: 'Lösungsberatung anfordern' })} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SolutionDetail;
