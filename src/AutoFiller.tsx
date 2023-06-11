import React, {useState, useId} from 'react';
import axios, {AxiosRequestConfig} from 'axios';
import {load as loadCheerio} from 'cheerio';
import {htmlToText, HtmlToTextOptions} from 'html-to-text';

const partsOfSpeech = [
    'noun',
    'verb',
    'preposition',
    'adjective',
    'adverb',
    'interjection',
    'conjunction',
    'particle'
]

const htmlToTextOptions: HtmlToTextOptions = {
    selectors: [
        {
            selector: 'a',
            options: {
                ignoreHref: true
            }
        }
    ],
    wordwrap: false
};

type AutoFillerProps = {
    word: string,
    callback: (success: boolean, result: string) => void
};

const AutoFiller: React.FC<AutoFillerProps> = (props: AutoFillerProps) => {
    const [disabled, setDisabled] = useState(false);
    const [lang, setLang] = useState('English');
    const langId = useId();

    const getWiktionaryDefinition = async () => {
        if (!props.word || !props.word.trim()) {
            props.callback(false, 'Please enter a word to look up in the front side of the card');
            return;
        }

        setDisabled(true);
        let data: any;
        try {
            const config: AxiosRequestConfig = {
                method: 'GET',
                url: `https://en.wiktionary.org/w/api.php`,
                params: {
                    action: 'parse',
                    page: props.word,
                    disabletoc: true,
                    disableeditsection: true,
                    format: 'json',
                    origin: '*'
                }
            };
            const res = await axios(config);
            data = res.data;
        }
        catch (err) {
            props.callback(false, 'An error occurred: ' + err);
            return;
        }
        finally {
            setDisabled(false);
        }

        if ('error' in data) {
            const err = data.error;
            props.callback(false, `Error reading Wiktionary page: ${err.code}: ${err.info}`);
            return;
        }

        const html = data.parse.text['*'];
        const $ = loadCheerio(html);
        const section = Array.from($('h2')).find(section => $(section).first().text() === lang);
        if (!section) {
            props.callback(false, 'No definition exists for the language you selected');
            return;
        }

        // Get all same-level elements until the next language
        const elements = $(section).nextUntil('h2');
        let result: string[] = [];
        for (const e of elements) {
            const element = $(e);
            if (element.is('h3, h4, h5, h6')) {
                if (partsOfSpeech.includes(element.text().toLowerCase())) {
                    result.push(element.text());
                }
            }
            else if (element.is('p')) {
                const headword = element.find('.headword');
                if (headword.length > 0 && headword.next().length > 0) {
                    if (headword.next()[0].name === 'a')
                        headword.next().remove(); // transliteration guide link, this is useless
                    headword.remove();
                    let str = '- ' + htmlToText(element.html() as string, htmlToTextOptions);
                    result.push(str);
                }
            }
            else if (element.is('ol')) {
                for (const i of element.find('li')) {
                    const item = $(i);
                    let save: string[] = [];
                    for (const e2 of item.find('.h-quotation, .h-usage-example')) {
                        const extra = $(e2);
                        for (const d of extra.find('dd')) {
                            const line = $(d);
                            line.replaceWith(`<div>${line.html()}</div>`);
                        }
                        const text = htmlToText(extra.html() as string, htmlToTextOptions);
                        for (const line of text.split('\n')) {
                            save.push('          ' + line);
                        }
                    }

                    item.find('dl, ul, .citation-whole').remove();
                    const text = item.text().trim();
                    if (text) {
                        result.push(' * ' + text);
                    }
                    result = result.concat(save);
                }
            }
        }

        props.callback(true, result.join('\n'));
    };

    return (
        <>
            <h6>Auto-fill definition</h6>
            <label htmlFor={langId}>Input language</label>
            <select className="form-select mt-2" id={langId} value={lang} onChange={e => setLang(e.target.value)}>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="Italian">Italian</option>
                <option value="Portuguese">Portuguese</option>
                <option value="German">German</option>
                <option value="Russian">Russian</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
                <option value="Korean">Korean</option>
                <option value="Vietnamese">Vietnamese</option>
                <option value="Hindi">Hindi</option>
                <option value="Urdu">Urdu</option>
                <option value="Bengali">Bengali</option>
                <option value="Persian">Persian</option>
                <option value="Arabic">Arabic</option>
                <option value="Turkish">Turkish</option>
            </select>
            <div className="mt-3">
                <button type="button" className={'btn btn-light' + (disabled ? ' disabled' : '')}
                        onClick={getWiktionaryDefinition}>Wiktionary
                </button>
            </div>
        </>
    );
}

export default AutoFiller;