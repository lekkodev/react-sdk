import { ClientContext } from "js-sdk";
import { createStableKey } from "../helpers";
import { EvaluationType } from "../types";

const config = {
    namespaceName: 'namespace-1',
    configName: 'config-1',
    context: new ClientContext().setString('string', 'hello').setBoolean('bool', true).setInt('int', 2),
    evaluationType: EvaluationType.INT
}

describe('helpers', () => {
    it('should create a stable key for a lekko config', () => {
        expect(createStableKey(config)).toEqual("namespace-1_config-1_bool:{\"boolValue\":true}_int:{\"intValue\":\"2\"}_string:{\"stringValue\":\"hello\"}_Int")
    })
})