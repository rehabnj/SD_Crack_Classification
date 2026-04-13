"""
Converts model.json from Keras 3 format to Keras 2 format that TF.js understands.
Two changes:
  1. InputLayer: batch_shape -> batch_input_shape
  2. inbound_nodes: {args:[keras_tensors], kwargs:{}} -> [layer, node, tensor, {}]
"""
import json

def extract_history(kt):
    """Extract keras_history from a __keras_tensor__ object."""
    if isinstance(kt, dict) and kt.get('class_name') == '__keras_tensor__':
        return kt['config']['keras_history']  # [layer_name, node_idx, tensor_idx]
    return None

def convert_node(keras3_node):
    """
    Convert one Keras 3 node dict to Keras 2 array format.
    Single input:  {args: [t], ...}  -> ["layer", 0, 0, {}]
    Multi input:   {args: [[t1,t2]], ...} -> [["l1",0,0,{}], ["l2",0,0,{}]]
    """
    if not isinstance(keras3_node, dict) or 'args' not in keras3_node:
        return keras3_node  # already converted or unexpected

    args = keras3_node['args']
    if not args:
        return []

    arg0 = args[0]

    if isinstance(arg0, list):
        # Multi-input: args[0] is a list of keras_tensors
        result = []
        for t in arg0:
            h = extract_history(t)
            if h:
                result.append([h[0], h[1], h[2], {}])
        return result
    else:
        # Single input: args[0] is one keras_tensor
        h = extract_history(arg0)
        if h:
            return [h[0], h[1], h[2], {}]
        return []

def fix_layers(layers):
    """Recursively fix a list of layer configs."""
    for layer in layers:
        class_name = layer.get('class_name', '')
        config = layer.get('config', {})

        # Fix InputLayer: batch_shape -> batch_input_shape
        if class_name == 'InputLayer' and 'batch_shape' in config:
            config['batch_input_shape'] = config.pop('batch_shape')

        # Fix inbound_nodes
        if 'inbound_nodes' in layer:
            new_nodes = []
            for node in layer['inbound_nodes']:
                new_nodes.append(convert_node(node))
            layer['inbound_nodes'] = new_nodes

        # Recurse into nested Functional models
        if 'layers' in config:
            fix_layers(config['layers'])

def main():
    input_path  = 'CrackDetectorApp/assets/model/model.json'
    output_path = 'CrackDetectorApp/assets/model/model.json'

    with open(input_path, 'r') as f:
        model_json = json.load(f)

    # Unwrap Keras 3 model_config if present
    mt = model_json['modelTopology']
    if 'model_config' in mt:
        topology = mt['model_config']
        # Replace modelTopology with just the unwrapped config
        model_json['modelTopology'] = topology
    else:
        topology = mt

    # Fix all layers recursively
    top_layers = topology.get('config', {}).get('layers', [])
    fix_layers(top_layers)

    with open(output_path, 'w') as f:
        json.dump(model_json, f)

    print(f"Done. Converted model saved to {output_path}")

if __name__ == '__main__':
    main()
