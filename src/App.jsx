import React, { useEffect, useState } from 'react';
import { L7Editor } from '@antv/l7-editor';
import { GeoJsonEditor } from '@antv/l7-editor/es/components';

function hasWebGL() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  return Boolean(gl);
}

function toFeatures(data) {
  if (!data) return [];
  if (data.type === 'FeatureCollection' && Array.isArray(data.features)) return data.features;
  if (data.type === 'Feature') return [data];
  if (Array.isArray(data)) return data.filter((f) => f && f.type === 'Feature');
  throw new Error('不支持的 GeoJSON 格式');
}

async function loadGeoJsonFromParam(param) {
  const decoded = decodeURIComponent(param);
  let text = decoded;
  if (/^https?:\/\//i.test(decoded)) {
    const res = await fetch(decoded);
    text = await res.text();
  }
  const parsed = JSON.parse(text);
  return toFeatures(parsed);
}

export default function App() {
  const [webglReady, setWebglReady] = useState(true);
  const [features, setFeatures] = useState(undefined);
  const [loadState, setLoadState] = useState({ status: 'idle', message: '' });

  useEffect(() => {
    setWebglReady(hasWebGL());
  }, []);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('geojson');
    if (!param) {
      setLoadState({ status: 'ready', message: '' });
      return;
    }
    let canceled = false;
    (async () => {
      try {
        setLoadState({ status: 'loading', message: '' });
        const feats = await loadGeoJsonFromParam(param);
        if (!canceled) {
          setFeatures(feats);
          setLoadState({ status: 'ready', message: '' });
        }
      } catch (err) {
        if (!canceled) setLoadState({ status: 'error', message: err?.message || '解析 GeoJSON 失败' });
      }
    })();
    return () => {
      canceled = true;
    };
  }, []);

  if (!webglReady) {
    return (
      <div className="page">
        <div className="fallback">
          <h2>无法创建 WebGL 上下文</h2>
          <p>请确认浏览器已开启硬件加速，或更换支持 WebGL 的浏览器/设备后重试。</p>
        </div>
      </div>
    );
  }

  if (loadState.status === 'loading') {
    return (
      <div className="page">
        <div className="fallback">
          <h3>正在加载 GeoJSON...</h3>
        </div>
      </div>
    );
  }

  if (loadState.status === 'error') {
    return (
      <div className="page">
        <div className="fallback">
          <h2>GeoJSON 解析失败</h2>
          <p>{loadState.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <L7Editor
        className="editor"
        mapOption={{ mapOptions :{zoom: 11, center: [116, 39]} }}
        activeTab="geojson"
        tabItems={[{ key: 'geojson', label: 'GeoJSON', children: <GeoJsonEditor /> }]}
        features={features}
        coordConvert="WGS84"
        mapControl={{ saveMapOptionsControl: false }}
        toolbar={{logo: false, baseMap : false, import: false, download : false, guide: false, help: false, setting: false, theme: false, dingTalk: false, i18n: false}}
      />
    </div>
  );
}
