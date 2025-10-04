import Converter from "../components/Converter/Converter";
import { useTranslation } from 'react-i18next';

const ConverterPage = () => {
  const { t } = useTranslation('common');
  return (
    <section>
      <div className="container">
        <h2>{t('pages.converter.title')}</h2>
        <Converter />
      </div>
    </section>
  );
};

export default ConverterPage;
