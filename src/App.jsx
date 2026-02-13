import React, { useEffect, useState } from 'react';
import { L7Editor } from '@antv/l7-editor';
import { GeoJsonEditor } from '@antv/l7-editor/es/components';
import { ungzip } from 'pako';

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

  const parseText = (text) => toFeatures(JSON.parse(text));

  const parseBase64Gzip = (maybeBase64) => {
    try {
      const binary = atob(maybeBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      const inflated = ungzip(bytes, { to: 'string' });
      return parseText(inflated);
    } catch (err) {
      throw new Error('GeoJSON 参数既不是有效的 JSON，也不是 base64+gzip 文本');
    }
  };

  const tryParseLocal = () => {
    try {
      return parseText(decoded);
    } catch (_) {
      return parseBase64Gzip(decoded);
    }
  };

  if (/^https?:\/\//i.test(decoded)) {
    const res = await fetch(decoded);
    // Prefer binary in case the response is gzipped.
    const buffer = await res.arrayBuffer();
    try {
      const inflated = ungzip(new Uint8Array(buffer), { to: 'string' });
      return parseText(inflated);
    } catch (_) {
      const text = new TextDecoder().decode(buffer);
      return parseText(text);
    }
  }

  return tryParseLocal();
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
        showTextLayer = "true"
        textLayerFields = {[ 'desc']}
      />
    </div>
  );
}
