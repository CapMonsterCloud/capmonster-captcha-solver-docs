import React from 'react';
import styles from './styles.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import getLocaleStrings from '../../locales/index';
import FeedbackModal from '@theme/FeedbackModal';

const surveyId = 'jw36i4rc99kmcdt4esp29pc8';
const formbricksHost = 'https://survey.zennolab.com';
const environemntId = 'cmbs2hq260009y101wis444f3';

enum ANSWERS {
  yes = 'Yes 👍',
  no = 'No 👎',
}

export default function RightWidget() {
  const [pageUrl, setPageUrl] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [responseId, setResponseId] = React.useState<string | null>(null);
  const { i18n } = useDocusaurusContext();
  const t = getLocaleStrings(i18n?.currentLocale);

  const [topOffset, setTopOffset] = React.useState(0);

  const calculateOffset = () => {
    const toc = document.querySelector('[class^="tableOfContents_"]');
    const tocStyle = toc ? getComputedStyle(toc) : { top: '0' };
    const stickyTopPx = parseFloat(tocStyle.top) || 0;
    const height = (toc as HTMLElement)?.offsetHeight;
    setTopOffset(height + stickyTopPx + 24); // 24 - marginTop
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.href);
      calculateOffset();
    }
  }, []);

  const createSurvey = async (YesNo: ANSWERS) => {
    const payload = {
      data: {
        isHelpful: YesNo,
        pageUrl: pageUrl, // So you know which page the user gives feedback about.
      },
      surveyId: surveyId,
      finished: false,
    };

    try {
      const res = await fetch(
        `${formbricksHost}/api/v1/client/${environemntId}/responses`,

        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        const responseJson = await res.json();
        return responseJson?.data?.id;
      } else {
        console.error('Error submitting form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const updateSurvey = async (responseId: string | null | undefined, comment: string) => {
    const payload = {
      data: {
        additionalInfo: comment,
      },
      surveyId: surveyId,
      finished: true,
    };

    try {
      const res = await fetch(
        `${formbricksHost}/api/v1/client/${environemntId}/responses/${responseId}`,

        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        const responseJson = await res.json();
        return responseJson?.data?.id;
      } else {
        console.error('Error submitting form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleModalSubmit = async (payload: { responseId?: string | null; comment: string }) => {
    await updateSurvey(payload?.responseId, payload?.comment);
  };

  const openModalWithResponse = (id: string | null | undefined) => {
    setResponseId(id ?? null);
    setIsModalOpen(true);
  };

  const handleClickLike = async () => {
    const id = await createSurvey(ANSWERS.yes);
    openModalWithResponse(id);
  };

  const handleClickDislike = async () => {
    const id = await createSurvey(ANSWERS.no);
    openModalWithResponse(id);
  };

  return (
    <div className={styles.wrap} style={{ top: topOffset }}>
      <div className={styles.header}>{t.articleHelpfulQuestion}</div>
      <div className={styles.iconsWrap}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          onClick={handleClickLike}
        >
          <path d="M22.7689 8.09124C22.3001 7.56591 21.7207 7.14466 21.0698 6.85602C20.419 6.56737 19.712 6.41807 18.9966 6.41822H15.0083L15.3443 4.43413C15.4631 3.73543 15.3197 3.01846 14.9402 2.414C14.5607 1.80954 13.9703 1.35787 13.2768 1.14136C12.5833 0.924846 11.8329 0.957927 11.1624 1.23457C10.4919 1.51121 9.94599 2.01297 9.62428 2.64834L7.71063 6.41822H4.99911C3.67375 6.41976 2.40313 6.93236 1.46596 7.84356C0.528788 8.75476 0.00158757 9.99018 0 11.2788L0 16.1394C0.00158757 17.428 0.528788 18.6635 1.46596 19.5747C2.40313 20.4859 3.67375 20.9985 4.99911 21H18.2967C19.5 20.9952 20.6615 20.5706 21.57 19.8035C22.4784 19.0363 23.0735 17.9776 23.2469 16.8199L23.9517 11.9593C24.051 11.2698 23.9968 10.5676 23.7927 9.90028C23.5886 9.23294 23.2395 8.616 22.7689 8.09124ZM1.99964 16.1394V11.2788C1.99964 10.5053 2.31566 9.76356 2.87817 9.21664C3.44068 8.66971 4.2036 8.36246 4.99911 8.36246H6.99875V19.0558H4.99911C4.2036 19.0558 3.44068 18.7485 2.87817 18.2016C2.31566 17.6547 1.99964 16.9129 1.99964 16.1394ZM21.9671 11.6861L21.2612 16.5467C21.158 17.2408 20.802 17.8758 20.258 18.3363C19.7139 18.7967 19.018 19.052 18.2967 19.0558H8.9984V8.10387C9.09262 8.02406 9.17062 7.92778 9.22835 7.82001L11.417 3.50867C11.499 3.36473 11.6151 3.24177 11.7555 3.14992C11.896 3.05806 12.0569 2.99992 12.2249 2.98028C12.393 2.96064 12.5634 2.98005 12.7223 3.03693C12.8811 3.0938 13.0238 3.18651 13.1387 3.30744C13.2369 3.4185 13.3087 3.54927 13.349 3.69042C13.3892 3.83157 13.397 3.97963 13.3716 4.12402L12.8437 7.2348C12.8205 7.37379 12.8287 7.51602 12.8676 7.65165C12.9066 7.78727 12.9753 7.91306 13.0692 8.0203C13.163 8.12754 13.2797 8.21368 13.4112 8.27276C13.5426 8.33183 13.6857 8.36244 13.8305 8.36246H18.9966C19.4259 8.3624 19.8503 8.45196 20.2409 8.62507C20.6316 8.79818 20.9795 9.05082 21.2611 9.36591C21.5427 9.681 21.7515 10.0512 21.8733 10.4515C21.995 10.8518 22.027 11.2728 21.9671 11.6861Z" />
        </svg>

        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          onClick={handleClickDislike}
        >
          <path d="M1.23106 15.9088C1.69989 16.4341 2.27934 16.8553 2.93018 17.144C3.58101 17.4326 4.28804 17.5819 5.00339 17.5818H8.99168L8.65574 19.5659C8.53687 20.2646 8.68028 20.9815 9.0598 21.586C9.43932 22.1905 10.0297 22.6421 10.7232 22.8586C11.4167 23.0752 12.1671 23.0421 12.8376 22.7654C13.5081 22.4888 14.054 21.987 14.3757 21.3517L16.2894 17.5818H19.0009C20.3263 17.5802 21.5969 17.0676 22.534 16.1564C23.4712 15.2452 23.9984 14.0098 24 12.7212V7.86059C23.9984 6.57196 23.4712 5.33654 22.534 4.42534C21.5969 3.51414 20.3263 3.00154 19.0009 3H5.70326C4.50001 3.00479 3.33851 3.42938 2.43005 4.19652C1.52159 4.96367 0.926535 6.0224 0.753145 7.18011L0.0482712 12.0407C-0.0509968 12.7302 0.00323677 13.4324 0.207298 14.0997C0.411362 14.7671 0.76049 15.384 1.23106 15.9088ZM22.0004 7.86059V12.7212C22.0004 13.4947 21.6843 14.2364 21.1218 14.7834C20.5593 15.3303 19.7964 15.6375 19.0009 15.6375H17.0012V4.94424H19.0009C19.7964 4.94424 20.5593 5.2515 21.1218 5.79842C21.6843 6.34534 22.0004 7.08713 22.0004 7.86059ZM2.03292 12.3139L2.73879 7.45327C2.84199 6.75919 3.19798 6.12418 3.74202 5.66373C4.28605 5.20327 4.98199 4.94797 5.70326 4.94424H15.0016V15.8961C14.9074 15.9759 14.8294 16.0722 14.7716 16.18L12.583 20.4913C12.501 20.6353 12.3849 20.7582 12.2445 20.8501C12.104 20.9419 11.9431 21.0001 11.7751 21.0197C11.607 21.0394 11.4366 21.0199 11.2777 20.9631C11.1189 20.9062 10.9762 20.8135 10.8613 20.6926C10.7631 20.5815 10.6913 20.4507 10.651 20.3096C10.6108 20.1684 10.603 20.0204 10.6284 19.876L11.1563 16.7652C11.1795 16.6262 11.1713 16.484 11.1324 16.3484C11.0934 16.2127 11.0247 16.0869 10.9308 15.9797C10.837 15.8725 10.7203 15.7863 10.5888 15.7272C10.4574 15.6682 10.3143 15.6376 10.1695 15.6375H5.00339C4.57406 15.6376 4.14972 15.548 3.75906 15.3749C3.36839 15.2018 3.0205 14.9492 2.7389 14.6341C2.4573 14.319 2.24854 13.9488 2.12675 13.5485C2.00495 13.1482 1.97295 12.7272 2.03292 12.3139Z" />
        </svg>
      </div>
      <FeedbackModal
        isOpen={isModalOpen}
        responseId={responseId}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
