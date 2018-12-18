import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as bunyan from 'bunyan';
const log = bunyan.createLogger({name: 'wring'});

// Type for the Yaml document
type keys = string | number;
type doc = {
    [K in keys] : any;
}

export class Wring {

    private Collection = class {
        private yamlContents: doc;
        private key: keys;

        /**
         * Initialize the Collection with the JSON document containing
         * key value pairs
         * @param contents 
         */
        constructor(contents: doc) {
            this.yamlContents = contents;
        }

        /**
         * Get a single item from the collection
         * @param key 
         */
        get(key: string | number) : any {
            if (key in this.yamlContents)
                return this.yamlContents[key];
            else
                return null;
        }

        private Formatter = class {
            private message: string;

            constructor (message: string) {
                this.message = message;
            }

            /**
             * Function to format the given string with a specified object
             * object should contain key value pairs
             * @param items 
             */
            format(items: doc) {
                let result = this.message.toString();

                for (let key of Object.keys(items)) {
                    let pattern = new RegExp(`{{${key}}}`, 'g');
                    result = result.replace(pattern, items[key]);
                }
                return result;
            }
        }

        /**
         * 
         * @param key 
         */
        use(key: string) {
            if (key in this.yamlContents) {
                return new this.Formatter(this.yamlContents[key]);
            } else {
                log.error()
                return null;
            }
        }
    }


    /**
     * Function to load a given yaml file contents
     * Checks for valid files and loads using js-yaml
     * @param filePath 
     */
    load(filePath : string) {
        if (filePath && fs.existsSync(path.resolve(path.dirname(module.parent.filename), filePath))) {
            try {
                let yamlFilePath = path.resolve(path.dirname(module.parent.filename), filePath);
                let yamlContents = yaml.safeLoad(fs.readFileSync(yamlFilePath, 'utf-8'));
                return new this.Collection(yamlContents);

            } catch (error) {
                // error when opening or parsing file
                log.error(`Unable to load file : ${error}`);
                return null;
            };
        } else {
            // Unable to open file from specified file path
            log.error(`Unable to open data file: ${filePath}`);
            return null;
        }
    }


    get(key: string) {

    }

}
