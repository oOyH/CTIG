import React, { useState, useRef } from 'react';
import {
  Button,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  MenuItem,
} from '@mui/material';
import html2canvas from 'html2canvas';
import * as htmlToImage from 'html-to-image';
import gifshot from 'gifshot';

// 定义类型
interface Line {
  x1: number;
  y1: number;
  length: number;
  angle: number;
  color: string;
}

interface Emoji {
  emoji: string;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  scale: number;
}

interface ScatteredChar {
  char: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  opacity: number;
  fontSize: number;
}

function App() {
  // 状态定义
  const [topText, setTopText] = useState('');
  const [mainText, setMainText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [styles, setStyles] = useState<string[]>(['emoji']);
  const [showCanvas, setShowCanvas] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fontSize, setFontSize] = useState(40);
  const [fontFamily, setFontFamily] = useState('Arial');

  // 添加可选字体列表
  const fontOptions = [
    { value: 'Arial', label: '默认字体' },
    { value: '"Times New Roman"', label: '衬线字体' },
    { value: 'Georgia', label: '优雅字体' },
    { value: 'Impact', label: '粗体字体' },
    { value: '"Comic Sans MS"', label: '可爱字体' },
  ];

  // 生成随机线条
  const generateRandomLines = (): Line[] => {
    const lines: Line[] = [];
    const colors = [
      '#d00b57',
      '#eb89a7', 
      '#a789eb',
      '#89eba7',
      '#eba789',
    ];

    const numCurves = 30; // 增加曲线数量
    const pointsPerCurve = 40;

    for (let c = 0; c < numCurves; c++) {
      const controlPoints = [];
      
      // 随机起点，避免集中在中间
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      
      controlPoints.push({ x: startX, y: startY });
      
      // 生成2-4个随机控制点，增加曲线变化
      const numControls = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numControls; i++) {
        // 确保控制点分布更均匀
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // 避免所有控制点都集中在中间
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - 50, 2) + Math.pow(y - 50, 2)
        );
        
        if (distanceFromCenter < 20) {
          // 如果太靠近中心，将点推向边缘
          const angle = Math.atan2(y - 50, x - 50);
          controlPoints.push({
            x: 50 + Math.cos(angle) * (20 + Math.random() * 30),
            y: 50 + Math.sin(angle) * (20 + Math.random() * 30)
          });
        } else {
          controlPoints.push({ x, y });
        }
      }

      // 生成曲线点
      for (let i = 0; i < pointsPerCurve; i++) {
        const t = i / pointsPerCurve;
        const point1 = getBezierPoint(controlPoints, t);
        const point2 = getBezierPoint(controlPoints, t + 1/pointsPerCurve);
        
        // 放宽中间区域限制
        if (point1.y > 35 && point1.y < 65 && point1.x > 35 && point1.x < 65) {
          continue;
        }

        const length = Math.sqrt(
          Math.pow(point2.x - point1.x, 2) + 
          Math.pow(point2.y - point1.y, 2)
        );
        
        const angle = Math.atan2(
          point2.y - point1.y,
          point2.x - point1.x
        );

        lines.push({
          x1: point1.x,
          y1: point1.y,
          length,
          angle,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    return lines;
  };

  // 添加贝塞尔曲线计算函数
  const getBezierPoint = (points: Array<{x: number, y: number}>, t: number) => {
    if (points.length === 1) {
      return points[0];
    }
    
    const newPoints = [];
    for (let i = 0; i < points.length - 1; i++) {
      newPoints.push({
        x: points[i].x * (1 - t) + points[i + 1].x * t,
        y: points[i].y * (1 - t) + points[i + 1].y * t
      });
    }
    
    return getBezierPoint(newPoints, t);
  };

  // 修改生成随机表情的函数，减小最小间距允许轻微重叠
  const generateRandomEmojis = (): Emoji[] => {
    const emojis = [
      '🌸', '✨', '💫', '🌟', '💝', '🎀', '🍠', '🌺', '🎈', '🪽', '🌷', '🍡',
      '💗', '🎉', '📕', '🔖', '🌢', '🌣', '🎔', '🎕', '🎘', '🎜', '🎝',
      '🌹', '🌻', '🌼', '🌱', '🍀', '🌿', '🎋', '🎍', '🪴', '🌳', '🌴',
      '🌵', '🍦', '🍪', '🎂', '🍰', '🥧', '🍫', '🍯', '🍼', '🥛', '☕', 
      '🍵', '🍶', '🍾', '🍷', '🍻', '🥂', '🥃', '🥤', '🥢', '🍽', '🍴',
      '🌍', '🌎', '🌏', '🌐', '🗺', '🗾', '🏔', '⛰', '🌋', '🗻', '🏕',
      '🎠', '🎡', '🎢', '🎪', '🎭', '🎨', '🚂', '🚃', '🚄', '🛩',
      '⌛', '⏳', '⌚', '🕰',  '🐷', '🌔', '🌕', '🌖','🥑','🍑','🥝',
      '🎃', '🎄', '🎆', '🎇', '🎈', '🎉', '🎊', '🎋', '🎍', '🎎', '🎏',
    ];
    const positions: Emoji[] = [];
    const minDistance = 10; // 减小最小间距
    
    const isValidPosition = (x: number, y: number) => {
      for (const pos of positions) {
        const distance = Math.sqrt(
          Math.pow(pos.x - x, 2) + 
          Math.pow(pos.y - y, 2)
        );
        if (distance < minDistance) {
          return false;
        }
      }
      return true;
    };
    
    for (let i = 0; i < 50; i++) { // 减少emoji数量
      let x: number, y: number;
      let attempts = 0;
      do {
        x = Math.random() * 90 + 5; // 留出边距
        y = Math.random() * 90 + 5;
        attempts++;
      } while (!isValidPosition(x, y) && attempts < 50);
      
      if (attempts < 50) { // 如果找到合适位置
        positions.push({
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          x,
          y,
          rotation: Math.random() * 360,
          opacity: 0.4 + Math.random() * 0.2, // 增加透明度范围到0.4-0.6
          scale: 1.1 + Math.random() * 0.3,
        });
      }
    }
    return positions;
  };

  // 修改文字生成部分
  const generateScatteredText = (text: string): ScatteredChar[] => {
    const colors = [
      '#d00b57',
      '#eb89a7',
      '#a789eb',
      '#89eba7',
      '#eba789',
    ];
    
    // 计算基础参数
    const centerY = 50;
    const maxWidth = 80;
    const totalChars = text.length;
    const defaultFontSize = 40;
    
    // 计算实际字体大小和缩放比例
    const actualFontSize = fontSize;
    
    // 计算文字总宽度
    const totalWidth = totalChars * (actualFontSize * 1.2);
    const containerWidth = 400;
    const maxAllowedWidth = containerWidth * (maxWidth / 100);
    
    // 判断是否需要增加弯曲程度
    const isOverflow = totalWidth > maxAllowedWidth;
    
    // 根据溢出状态调整弯曲参数
    const waveHeight = isOverflow ? 25 : 10; // 溢出时增加波浪高度
    const waveFrequency = isOverflow ? 1.5 : 1; // 溢出时增加波浪频率
    const centerYOffset = isOverflow ? 10 : 0; // 溢出时整体下移
    
    // 计算缩放比例
    const scale = Math.min(1, maxAllowedWidth / totalWidth);
    const finalFontSize = actualFontSize;
    
    // 计算起始X位置
    const scaledTotalWidth = totalWidth * scale;
    const startX = (100 - (scaledTotalWidth / containerWidth * 100)) / 2;
    
    return text.split('').map((char, index) => {
      const charWidth = finalFontSize * 1.2;
      const x = startX + (index * charWidth / containerWidth * 100);
      
      // 计算Y轴波浪效果，溢出时使用更复杂的曲线
      const progress = index / totalChars;
      const wave = Math.sin(progress * Math.PI * waveFrequency) * waveHeight;
      
      // 溢出时添加抛物线效果
      const parabola = isOverflow ? (progress - 0.5) * (progress - 0.5) * 20 : 0;
      
      // 计算最终Y位置
      const y = centerY + wave + parabola + centerYOffset;
      
      // 根据位置计算旋转角度
      const maxRotation = isOverflow ? 25 : 15;
      const rotationBase = ((progress - 0.5) * maxRotation);
      const rotationOffset = isOverflow ? Math.sin(progress * Math.PI) * 15 : 0;
      const rotation = rotationBase + rotationOffset + (Math.random() - 0.5) * 10;
      
      return {
        char: char === 'I' ? 'i' : char === 'l' ? 'L' : char,
        x,
        y,
        rotation,
        scale: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.4 + Math.random() * 0.2,
        fontSize: finalFontSize,
      };
    });
  };

  // 处理生成图片
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      if (!canvasRef.current) return;
      
      if (!styles.includes('dynamic')) {
        // 如果没有选择动态效果，使用原来的静态图片生成方式
        const canvas = await html2canvas(canvasRef.current, {
          backgroundColor: null,
          scale: 2,
          logging: false,
        });
        
        const link = document.createElement('a');
        link.download = 'xhs-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        // 优化GIF生成参数
        const frames: string[] = [];
        const frameCount = 6; // 减少帧数
        
        for (let i = 0; i < frameCount; i++) {
          const dataUrl = await htmlToImage.toPng(canvasRef.current, {
            backgroundColor: null,
            pixelRatio: 1.5, // 降低分辨率以提高性能
          });
          frames.push(dataUrl);
          
          // 减少等待时间
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        gifshot.createGIF({
          images: frames,
          gifWidth: canvasRef.current.offsetWidth * 1.5,
          gifHeight: canvasRef.current.offsetHeight * 1.5,
          interval: 0.2,
          numFrames: frameCount,
          frameDuration: 1,
          sampleInterval: 12,
          quality: 8,
        }, function(obj) {
          if(!obj.error) {
            const link = document.createElement('a');
            link.download = 'xhs-image.gif';
            link.href = obj.image;
            link.click();
          }
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const scatteredChars = generateScatteredText(mainText);
  const emojis = generateRandomEmojis();
  const lines = generateRandomLines();

  // 添加动态效果的样式
  const dynamicStyle = {
    animation: 'float 3s ease-in-out infinite',
  };

  // 修改动画式，使其更适合捕获
  const getAnimationStyle = (index: number) => ({
    animation: styles.includes('dynamic') 
      ? `float 3s ease-in-out infinite ${(index * 0.2) % 1}s`
      : undefined,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-2xl font-bold">小红书加微引导图生成器</h1>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-medium">
                  ⚠️ 重要提示
                </p>
                <p className="mt-2 text-sm text-yellow-600">
                  本工具不保证100%不被识别，切勿用于违法行为，使用时请自行承担风险。
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm font-semibold">📝【使用方法】</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>输入你的微信号，上下引导语可以自发挥</li>
            <li>选择背景样式，生成图片</li>
            <li>手动保存图片，添加到小红书表情包</li>
          </ul>
        </div>

        <div className="space-y-6 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">顶部引导语</label>
            <TextField
              fullWidth
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              placeholder="例如: 聪明的你一定可以看到地球号"
              variant="outlined"
              size="small"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              微信号 <span className="text-red-500">*</span>
            </label>
            <TextField
              fullWidth
              required
              value={mainText}
              onChange={(e) => setMainText(e.target.value)}
              placeholder="请输入微信号"
              variant="outlined"
              size="small"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">底部引导语</label>
            <TextField
              fullWidth
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              placeholder="例如: 以上全都都是英文字母"
              variant="outlined"
              size="small"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">字体设置</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">字体大小</label>
                <TextField
                  type="number"
                  value={fontSize}
                  onChange={(e) => {
                    const size = Number(e.target.value);
                    setFontSize(Math.min(Math.max(size, 20), 100));
                  }}
                  inputProps={{ 
                    min: 20, 
                    max: 100,
                    step: 2
                  }}
                  size="small"
                  fullWidth
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">字体样式</label>
                <TextField
                  select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  size="small"
                  fullWidth
                >
                  {fontOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">背景样式</label>
            <div className="flex flex-wrap gap-4 justify-center">
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={styles.includes('lines')}
                    onChange={(e) => {
                      if(e.target.checked) {
                        setStyles([...styles, 'lines']);
                      } else {
                        setStyles(styles.filter(s => s !== 'lines'));
                      }
                    }}
                  />
                }
                label="彩色干扰线"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={styles.includes('emoji')}
                    onChange={(e) => {
                      if(e.target.checked) {
                        setStyles([...styles, 'emoji']);
                      } else {
                        setStyles(styles.filter(s => s !== 'emoji'));
                      }
                    }}
                  />
                }
                label="随机Emoji"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={styles.includes('dynamic')}
                    onChange={(e) => {
                      if(e.target.checked) {
                        setStyles([...styles, 'dynamic']);
                      } else {
                        setStyles(styles.filter(s => s !== 'dynamic'));
                      }
                    }}
                  />
                }
                label="动态效果"
              />
            </div>
          </div>
        </div>

        <div 
          ref={canvasRef}
          className="relative bg-white border rounded-lg p-6 mb-6"
          style={{ 
            height: '500px', 
            overflow: 'hidden',
            background: 'linear-gradient(to bottom right, #fff5f5, #fff)',
          }}
        >
          {styles.includes('lines') && lines.map((line, i) => (
            <div
              key={`line-${i}`}
              className="absolute"
              style={{
                left: `${line.x1}%`,
                top: `${line.y1}%`,
                width: `${line.length}%`,
                height: '3px', // 增加线粗细
                background: line.color,
                transform: `rotate(${line.angle}rad)`,
                opacity: 0.3, // 降低透明度
                transformOrigin: '0 0',
                pointerEvents: 'none',
                boxShadow: '0 0 3px rgba(0,0,0,0.15)', // 增加阴影
                transition: 'all 0.3s ease',
              }}
            />
          ))}

          {styles.includes('emoji') && emojis.map((emoji, i) => (
            <div
              key={`emoji-${i}`}
              className="absolute"
              style={{
                left: `${emoji.x}%`,
                top: `${emoji.y}%`,
                transform: `rotate(${emoji.rotation}deg) scale(${emoji.scale})`,
                fontSize: '24px',
                opacity: emoji.opacity,
                pointerEvents: 'none',
                userSelect: 'none',
                willChange: 'transform',
                ...getAnimationStyle(i),
              }}
            >
              {emoji.emoji}
            </div>
          ))}
          
          <div className="relative z-10 text-center">
            {topText && (
              <p 
                className="text-gray-600 mb-8" 
                style={{ 
                  fontSize: '16px',
                  opacity: 0.2 + Math.random() * 0.2
                }}
              >
                {topText}
              </p>
            )}
            
            <div className="relative" style={{ 
              height: '300px', 
              overflow: 'hidden',
              margin: '0 auto',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {scatteredChars.map((char, i) => (
                <div
                  key={`char-${i}`}
                  className="absolute inline-block"
                  style={{
                    left: `${char.x}%`,
                    top: `${char.y}%`,
                    transform: `rotate(${char.rotation}deg)`,
                    fontSize: `${char.fontSize}px`,
                    fontFamily: fontFamily,
                    color: char.color,
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    opacity: char.opacity,
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {char.char}
                </div>
              ))}
            </div>
            
            {bottomText && (
              <p 
                className="text-gray-600 mt-8" 
                style={{ 
                  fontSize: '16px',
                  opacity: 0.2 + Math.random() * 0.2
                }}
              >
                {bottomText}
              </p>
            )}
          </div>
        </div>

        <Button
          variant="contained"
          fullWidth
          onClick={handleGenerate}
          disabled={!mainText || isGenerating}
          style={{
            background: 'linear-gradient(45deg, #FF385C 30%, #FF5B79 90%)',
            boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
          }}
        >
          {isGenerating ? '生成图片...' : '生成图片'}
        </Button>

        <div className="mt-4 text-sm text-gray-500">
          <p>💡 建议：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>多生成几张不同的图轮换使用</li>
            <li>使用此工具若判违规，与本人无关，请谨慎使用</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;