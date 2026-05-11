import { useState, useCallback, useEffect, useMemo } from 'react';

export interface AdminConfig {
  videoUrl: string;
  thumbnailUrl: string;
  docUrl: string;
  docLabel: string;
  appTitle: string;
  appSubtitle: string;
  question1: string;
  question1Label: string;
  question2: string;
  question2Label: string;
  question3: string;
  question3Label: string;
}

const DEFAULT_CONFIG: AdminConfig = {
  videoUrl: 'https://www.youtube.com/embed/2A1UTWcvwvU?rel=0&autoplay=0',
  thumbnailUrl: '',
  docUrl: 'https://docs.google.com/document/d/1sahA-y-Tj9P5SZ_B2_yuf30tf43jKpSGqnOHgHZAzKM/edit?usp=sharing',
  docLabel: "Ouvrir le document d'accompagnement dans une nouvelle fenêtre",
  appTitle: 'QUESTIONS ACTIVITÉ 1',
  appSubtitle: 'Aide Soignant',
  question1: `
    <p>Domaines d'activités (DA) :</p>
    <p><strong style="color: rgb(3, 105, 161);">DA1 - Accompagnement et soins de la personne dans les activités de sa vie quotidienne et de sa vie sociale en repérant les fragilités</strong></p>
    <p><br></p>
    <p>Activité 1 - Accompagnement et soins de la personne dans les activités de sa vie quotidienne et de sa vie sociale en repérant les fragilités.</p>
    <p><br></p>
    <p><strong>Dans votre expérience, décrivez une situation où vous avez réalisé ces soins.</strong></p>
  `,
  question1Label: 'Question 1 - Activité 1',
  question2: `
    <p>Activité 2 – Identification des risques lors de l'accompagnement de la personne et mise en œuvre d'actions de prévention adéquates</p>
    <p><br></p>
    <p><strong>As-tu rencontré des difficultés ?</strong></p>
  `,
  question2Label: 'Question 2 - Activité 2',
  question3: `
    <p>Activité 2 – Identification des risques lors de l'accompagnement de la personne et mise en œuvre d'actions de prévention adéquates</p>
    <p><br></p>
    <p><strong>Raconte-moi comment tu as surmonté cette difficulté.</strong></p>
  `,
  question3Label: 'Question 3 - Activité 2',
};

const STORAGE_KEY = 'activite1_admin_config';
const ADMIN_SESSION_KEY = 'activite1_admin_session';

function loadConfig(): AdminConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_CONFIG };
}

function saveConfig(config: AdminConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function useAdminConfig() {
  const [config, setConfig] = useState<AdminConfig>(loadConfig);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    try {
      const session = localStorage.getItem(ADMIN_SESSION_KEY);
      if (session === 'true') setIsAdmin(true);
    } catch {
      /* ignore */
    }
  }, []);

  const login = useCallback((username: string, password: string) => {
    if (username === 'Admin' && password === 'Admin') {
      setIsAdmin(true);
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    setShowPanel(false);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }, []);

  const updateConfig = useCallback((newConfig: Partial<AdminConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      saveConfig(updated);
      return updated;
    });
  }, []);

  const questions = useMemo(
    () => [config.question1, config.question2, config.question3],
    [config.question1, config.question2, config.question3]
  );

  return {
    config,
    questions,
    isAdmin,
    showLogin,
    showPanel,
    login,
    logout,
    updateConfig,
    setShowLogin,
    setShowPanel,
  };
}
