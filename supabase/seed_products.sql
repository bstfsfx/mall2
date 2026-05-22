-- ==========================================
-- mall2 商品資料種子腳本 (35 件商品)
-- 請在 Supabase SQL Editor 中執行此腳本
-- ==========================================

DO $$
DECLARE
  cat_new   UUID;
  cat_tops  UUID;
  cat_bot   UUID;
  cat_out   UUID;
  cat_acc   UUID;
BEGIN

-- ============================================================
-- STEP 1: 建立分類 (5 個)
-- ============================================================
INSERT INTO public.categories (id, name, slug, image_url) VALUES
  (gen_random_uuid(), '新品上市', 'new-arrivals', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'),
  (gen_random_uuid(), '上衣',     'tops',         'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80'),
  (gen_random_uuid(), '下裝',     'bottoms',      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80'),
  (gen_random_uuid(), '外套',     'outerwear',    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'),
  (gen_random_uuid(), '配件',     'accessories',  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80')
ON CONFLICT (slug) DO NOTHING;

-- Fetch IDs after insert
SELECT id INTO cat_new FROM public.categories WHERE slug = 'new-arrivals';
SELECT id INTO cat_tops FROM public.categories WHERE slug = 'tops';
SELECT id INTO cat_bot  FROM public.categories WHERE slug = 'bottoms';
SELECT id INTO cat_out  FROM public.categories WHERE slug = 'outerwear';
SELECT id INTO cat_acc  FROM public.categories WHERE slug = 'accessories';

-- ============================================================
-- STEP 2: 新品上市 — 5 件
-- ============================================================
INSERT INTO public.products (category_id, name, slug, description, price, stock, image_url, status) VALUES

(cat_new, '限定版金屬感飛行夾克',
 'limited-metal-flight-jacket',
 '採用高品質仿皮革面料，金屬光澤呈現未來感設計。立領剪裁修身有型，拉鍊細節精緻考究。限量發售，每件附贈品牌認證卡。尺寸 S–XL。',
 3980, 25,
 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
 'active'),

(cat_new, '復古格紋寬版衫',
 'vintage-plaid-oversized-shirt',
 '90年代復古格紋圖案，寬版剪裁打造慵懶休閒感。純棉材質親膚舒適，可作為外搭或單穿。男女皆宜，百搭款式。',
 1580, 60,
 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
 'active'),

(cat_new, '解構設計感直筒長褲',
 'deconstructed-straight-trousers',
 '結合工裝與高街美學，多口袋設計兼具實用與時尚。斜紋棉布面料挺括有型，鬆緊腰頭穿脫方便。適合都會日常穿搭。',
 2380, 40,
 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&q=80',
 'active'),

(cat_new, '純色高領羊毛混紡毛衣',
 'solid-turtleneck-wool-blend-sweater',
 '60% 美麗諾羊毛、40% 棉質混紡，觸感柔軟不刺癢。高領設計保暖性佳，寬鬆版型舒適好穿。提供黑、米白、深灰三色。',
 2280, 35,
 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
 'active'),

(cat_new, '街頭潮流電繡棒球帽',
 'street-embroidered-baseball-cap',
 '高密度棉質六片帽體，正面立體電繡品牌標誌。可調節後扣設計，適合各種頭型。潮流必備單品。',
 980, 80,
 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&q=80',
 'active'),

-- ============================================================
-- STEP 3: 上衣 — 8 件
-- ============================================================
(cat_tops, '超大版型街頭印花T恤',
 'oversized-graphic-street-tee',
 '100% 純棉重磅布料，手感厚實。正面大面積街頭藝術印花，超大版型打造慵懶時髦感。機洗不變形，顏色持久不褪色。',
 880, 120,
 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
 'active'),

(cat_tops, '棉麻混紡POLO衫',
 'cotton-linen-polo-shirt',
 '55% 棉 + 45% 亞麻混紡，質感輕盈透氣。三粒鈕扣領口設計，適合休閒出遊或輕商務場合。提供白、淡藍、墨綠、卡其四色。',
 1280, 75,
 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
 'active'),

(cat_tops, '法式海軍條紋長袖衫',
 'french-navy-stripe-long-sleeve',
 '經典法式藍白條紋，來自 1858 年法國海軍傳統。精梳棉材質彈性好，圓領修身剪裁凸顯身形。永不退流行的百搭款。',
 1180, 55,
 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
 'active'),

(cat_tops, '格子法蘭絨長袖衫',
 'plaid-flannel-long-sleeve',
 '雙層刷毛法蘭絨面料，觸感柔軟保暖。多色格紋設計，胸前口袋細節。可單穿或作為外搭穿在T恤外。',
 1380, 45,
 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800&q=80',
 'active'),

(cat_tops, '寬版抽繩連帽T',
 'oversized-drawstring-hoodie',
 '380g 重磅棉質連帽T，手感厚實溫暖。寬版剪裁落肩設計，袋鼠口袋。提供黑、白、灰、薄荷綠多色選擇。',
 1580, 90,
 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
 'active'),

(cat_tops, '竹節棉短袖T恤',
 'slub-cotton-short-sleeve-tee',
 '天然竹節棉紗線製成，肌理感豐富自然。透氣吸濕，適合台灣濕熱氣候。寬鬆版型穿脫舒適，居家外出皆宜。',
 680, 150,
 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
 'active'),

(cat_tops, '羅紋針織無袖背心',
 'ribbed-knit-sleeveless-vest',
 '細羅紋針織面料，彈性佳貼合身形。修身剪裁適合搭配外套或單穿。提供米白、黑、大地棕三色，層次穿搭的百搭內搭。',
 880, 65,
 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&q=80',
 'active'),

(cat_tops, '薄款防曬連帽風衣',
 'lightweight-sun-protection-windbreaker-hoodie',
 'UPF 50+ 防曬面料，阻擋 98% 紫外線。超輕薄可收納，重量僅 180g。連帽設計防風防曬，戶外旅遊必備。',
 1480, 50,
 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80',
 'active'),

-- ============================================================
-- STEP 4: 下裝 — 7 件
-- ============================================================
(cat_bot, '直筒經典牛仔褲',
 'straight-classic-denim-jeans',
 '100% 純棉丹寧布料，經典直筒版型永不退流行。五口袋設計，拉鍊門襟。深藍石洗，隨穿著時間產生自然刷色效果。',
 1880, 80,
 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
 'active'),

(cat_bot, '多口袋工裝寬版長褲',
 'multi-pocket-cargo-wide-trousers',
 '耐用厚磅棉布，雙側大容量立體口袋。鬆緊腰帶搭配抽繩調節，版型寬鬆舒適。街頭感十足，提供卡其、黑、軍綠三色。',
 1980, 55,
 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80',
 'active'),

(cat_bot, '復古刷色錐形褲',
 'vintage-washed-tapered-pants',
 '刷色水洗處理呈現復古感，錐形剪裁修飾腿型。腰部鬆緊帶設計，穿著舒適無束縛感。配運動鞋或皮鞋皆好看。',
 1680, 45,
 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80',
 'active'),

(cat_bot, '棉質五分休閒短褲',
 'cotton-relaxed-shorts',
 '輕量棉質面料，透氣舒適適合夏季。鬆緊腰頭附抽繩，長度及膝適中。提供海軍藍、卡其、黑、白四色，日常首選。',
 880, 100,
 'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800&q=80',
 'active'),

(cat_bot, '格紋修身西裝褲',
 'plaid-slim-fit-dress-trousers',
 '精紡毛料混紡面料，微格紋圖案低調有質感。修身版型拉長腿部比例，前中折線設計更顯挺括。適合辦公室或休閒商務場合。',
 2180, 35,
 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&q=80',
 'active'),

(cat_bot, '鬆緊腰抽繩慢跑褲',
 'elastic-drawstring-jogger-pants',
 '彈力棉質混紡，柔軟舒適。收口設計搭配側袋，運動休閒兩用。提供黑、深灰、藏青三色，全年皆宜。',
 1280, 70,
 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80',
 'active'),

(cat_bot, '個性破損設計牛仔短褲',
 'distressed-denim-shorts',
 '手工打磨破損效果，每件獨一無二。原色丹寧搭配做舊水洗，街頭個性十足。適合夏日搭配無袖背心或寬版T恤。',
 1380, 40,
 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=800&q=80',
 'active'),

-- ============================================================
-- STEP 5: 外套 — 8 件
-- ============================================================
(cat_out, '簡約都會風衣',
 'minimal-urban-trench-coat',
 '防潑水面料，擋風防雨實用機能。雙排扣經典設計，腰帶可調節輪廓。及膝長度百搭多種下身，提供駝色、黑色。',
 3480, 30,
 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80',
 'active'),

(cat_out, '皮革感機車夾克',
 'faux-leather-moto-jacket',
 '高質感PU仿皮革，觸感接近真皮。不對稱拉鍊設計，金屬配件光澤感佳。內裡保暖舖棉，秋冬必備帥氣款。',
 3280, 25,
 'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800&q=80',
 'active'),

(cat_out, '經典丹寧牛仔外套',
 'classic-denim-trucker-jacket',
 '12oz 重磅丹寧布料，耐穿耐洗。經典四口袋設計，單排鈕扣門襟。可單穿或疊穿連帽T裡面，是街頭穿搭的靈魂單品。',
 2180, 50,
 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800&q=80',
 'active'),

(cat_out, '機能連帽衝鋒衣',
 'functional-hooded-shell-jacket',
 '3層防水壓膠面料，防水指數 10000mm。可收納帽型設計，多口袋機能布局。適合登山健行或城市日常，輕量僅 380g。',
 4580, 20,
 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
 'active'),

(cat_out, '寬鬆針織開衫外套',
 'relaxed-knit-cardigan',
 '柔軟羅紋針織面料，輕盈不沈重。寬鬆版型適合搭配各種上衣。口袋設計、深V領，提供米白、燕麥、炭灰等大地色系。',
 1980, 55,
 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
 'active'),

(cat_out, '刺繡棒球外套',
 'embroidered-varsity-jacket',
 '雙色拼接設計，袖子撞色配色搶眼。正面精緻刺繡圖案，合身版型展現運動青春感。毛圈棉內裡保暖舒適。',
 2880, 35,
 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80',
 'active'),

(cat_out, '輕量保暖羽絨背心',
 'lightweight-puffer-vest',
 '90/10 鴨絨填充，保暖效果卓越。壓縮後體積小，方便收納攜帶。可搭配長袖T或連帽衫做層次穿搭，秋冬中間層首選。',
 2480, 40,
 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80',
 'active'),

(cat_out, '大衣格紋長版外套',
 'plaid-longline-overcoat',
 '義大利進口格紋毛料，手感厚實高級。寬鬆H型版型，長度至大腿中段。單排釦簡約設計，秋冬穿搭的焦點單品。',
 5280, 15,
 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80',
 'active'),

-- ============================================================
-- STEP 6: 配件 — 7 件
-- ============================================================
(cat_acc, '帆布大托特包',
 'canvas-large-tote-bag',
 '12oz 厚磅帆布製作，耐用抗撕裂。內含拉鍊夾層與多個口袋，A4資料夾輕鬆放入。品牌標誌刺繡，提供原色、黑、藏青三款。',
 1280, 60,
 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
 'active'),

(cat_acc, '真皮雙針牛仔腰帶',
 'genuine-leather-double-prong-belt',
 '頭層牛皮材質，皮面光澤自然。雙針扣頭設計耐用不變形，寬度 3.5cm 適合各式牛仔褲及休閒褲。提供黑色、棕色。',
 980, 45,
 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80',
 'active'),

(cat_acc, '漁夫帽 (Bucket Hat)',
 'bucket-hat-classic',
 '全棉斜紋布料，輕薄透氣。全周帽沿防曬效果佳，可摺疊收納。提供黑、白、卡其、迷彩多種顏色，夏日必備。',
 780, 90,
 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&q=80',
 'active'),

(cat_acc, '美麗諾羊毛圍巾',
 'merino-wool-scarf',
 '100% 美麗諾羊毛，觸感細膩不刺癢。尺寸 200cm x 35cm，圍法多樣。格紋圖案低調百搭，秋冬保暖造型兩全其美。',
 1480, 30,
 'https://images.unsplash.com/photo-1520903074185-8eca362b3dce?w=800&q=80',
 'active'),

(cat_acc, '簡約RFID防盜短夾',
 'minimal-rfid-blocking-wallet',
 '植鞣牛皮材質，隨使用時間產生美麗包漿。內建RFID阻擋層保護信用卡資訊安全。可放8張卡及鈔票，纖薄設計不撐破口袋。',
 1180, 50,
 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
 'active'),

(cat_acc, '金屬C型鏈條項鍊',
 'metal-chain-necklace',
 '316L不鏽鋼製作，不過敏不變色。18K金電鍍工藝，光澤持久。鏈條長度 50cm 附延長鍊，男女皆宜。極簡主義穿搭點睛之筆。',
 880, 70,
 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
 'active'),

(cat_acc, '復古飛行員墨鏡',
 'retro-aviator-sunglasses',
 '金屬鏡框復古飛行員造型，偏光鏡片有效阻擋紫外線。輕量鈦合金鏡架，長時配戴舒適無壓迫。附贈絨布眼鏡袋與擦鏡布。',
 1380, 40,
 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80',
 'active');

END $$;

-- ============================================================
-- VERIFY: 確認商品與分類建立成功
-- ============================================================
SELECT
  c.name  AS 分類,
  COUNT(p.id) AS 商品數量
FROM public.categories c
LEFT JOIN public.products p ON p.category_id = c.id
GROUP BY c.name
ORDER BY c.name;
