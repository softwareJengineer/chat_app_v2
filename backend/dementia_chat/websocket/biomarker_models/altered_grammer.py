import os
import stanza
import pandas as pd
from nltk.tree import Tree
import re
from datetime import datetime
from nltk.parse import stanford
import numpy as np
import pickle
import logging
import shutil
import nltk

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

nlp = stanza.Pipeline('en')

java_path = shutil.which("java")

if (not java_path):
    # java_path = r"C:\Program Files\Java\jdk-22\bin\java.exe"
    java_path = r'C\Program Files (x86)\Common Files\Oracle\Java\java8path\java.EXE'
os.environ['JAVAHOME'] = java_path
os.environ['JAVA_HOME'] = java_path
# nltk.internals.config_java(bin=java_path)

# Update this path to where you extracted the Stanford Parser
root_path = os.path.dirname(os.path.abspath(__file__))
stanford_parser_path = root_path + "/stanford-parser-full-2020-11-17"

# Set the CLASSPATH environment variable
os.environ['CLASSPATH'] = f"{stanford_parser_path}/stanford-parser.jar;{stanford_parser_path}/stanford-parser-4.2.0-models.jar"

# Set other required environment variables
os.environ['STANFORD_PARSER'] = stanford_parser_path
os.environ['STANFORD_MODELS'] = stanford_parser_path

# Initialize the Stanford Parser
parser = stanford.StanfordParser(model_path=f"{stanford_parser_path}/englishPCFG.ser.gz")


"""get_altered_grammer_features function will take a list of sentences and the total speech duration
    of the sentences and returns the altered grammer score/probility. In the below function it calls calculate_probability
    where  the weights of the trained ML model and these features are used to calculate the score."""

def generate_grammar_score(list_sentences, speech_duration_seconds):
    logger.info(f"Generating grammar score for {list_sentences} sentences over {speech_duration_seconds} seconds")

    if not list_sentences:
        logger.warning("No sentences provided. Returning default score of 0.")
        return 0
    print
    extracted_features = {"coordinated_sentence":[],"subordinated_sentence":[],"reduced_sentence":[],"predicates":[], "production_rules":[],"function_words":[],"unique_words":[],"total_words":[],"character_length":[],"immediate_word_repetitions":[]}
    
    try:
        total_coordinated_sentence, total_subordinated_sentence, total_reduced_sentence, production_rules, function_words = pos_tags_features(list_sentences)
        logger.debug(f"POS tags features: coordinated={total_coordinated_sentence}, subordinated={total_subordinated_sentence}, reduced={total_reduced_sentence}")

        extracted_features["coordinated_sentence"].append(total_coordinated_sentence)
        extracted_features["subordinated_sentence"].append(total_subordinated_sentence)
        extracted_features["reduced_sentence"].append(total_reduced_sentence)
        extracted_features["production_rules"].append(production_rules)
        extracted_features["function_words"].append(function_words)

        # Predicates calling
        overall_total_predicates = 0
        total_immediate_word_repetitions = 0
        total_text_character_length = 0
        total_unique_words = 0
        total_words = 0
        
        for data in list_sentences:
            doc = nlp(data)
            predicate_count = count_predicates(doc)
            unique_words, words = count_unique_words(data)
            immediate_word_repetitions = count_immediate_repetitions(data)
            text_character_length = count_characters(data)

            total_immediate_word_repetitions += immediate_word_repetitions
            total_text_character_length += text_character_length
            total_unique_words += unique_words
            total_words += words
            overall_total_predicates += predicate_count

        logger.debug(f"Extracted features: predicates={overall_total_predicates}, unique_words={total_unique_words}, total_words={total_words}, char_length={total_text_character_length}, repetitions={total_immediate_word_repetitions}")

        extracted_features["predicates"].append(overall_total_predicates)
        extracted_features["unique_words"].append(total_unique_words)
        extracted_features["total_words"].append(total_words)
        extracted_features["character_length"].append(total_text_character_length)
        extracted_features["immediate_word_repetitions"].append(total_immediate_word_repetitions)

        total_time_minutes = speech_duration_seconds / 60  # Convert to minutes
        df = pd.DataFrame(extracted_features)
        first_row = df.iloc[0]
        extracted_features = first_row.to_numpy()

        extracted_features_per_minute = extracted_features / total_time_minutes
        logger.debug(f"Features per minute: {extracted_features_per_minute}")

        altered_grammar_score = calculate_probability(extracted_features_per_minute)
        logger.info(f"Calculated altered grammar score: {altered_grammar_score}")

        return altered_grammar_score
    except Exception as e:
        logger.error(f"Error in generate_grammar_score: {str(e)}")
        return 0  # Return a default score in case of error

def calculate_probability(features):
    logger.info("Calculating probability")
    
    # Get the directory of the current script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Construct the path to the pickle files
    pickle_path = os.path.join(current_dir, "grammar_model", "pickle_files")
    
    logger.debug(f"Looking for pickle files in: {pickle_path}")
    
    # Check if the directory exists
    if not os.path.exists(pickle_path):
        logger.error(f"Directory not found: {pickle_path}")
        raise FileNotFoundError(f"Directory not found: {pickle_path}")
    
    # Get all .pkl files in the directory
    model_files = [f for f in os.listdir(pickle_path) if f.endswith('.pkl') and f != 'scaler.pkl']
    
    if not model_files:
        logger.error("No model .pkl files found in the pickle_files directory.")
        raise FileNotFoundError("No model .pkl files found in the pickle_files directory.")
    
    # Print all found model files for debugging
    logger.debug(f"Found model files: {model_files}")
    
    # Use the first model file found instead of trying to find the most recent
    most_recent_file = model_files[0]
    logger.info(f"Using model file: {most_recent_file}")
    
    # Load the model
    model_path = os.path.join(pickle_path, most_recent_file)
    try:
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        with open(model_path, 'rb') as file:
            logistic_model = pickle.load(file)
    except Exception as e:
        logger.error(f"Error loading model from {model_path}: {str(e)}")
        raise
    
    # Load the scaler
    scaler_path = os.path.join(pickle_path, 'scaler.pkl')
    try:
        if not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Scaler file not found: {scaler_path}")
        with open(scaler_path, 'rb') as file:
            scaler = pickle.load(file)
    except Exception as e:
        logger.error(f"Error loading scaler from {scaler_path}: {str(e)}")
        raise
    
    # Prepare and scale the features
    features = np.array(features).reshape(1, -1)
    features_scaled = scaler.transform(features)
    logger.debug(f"Scaled features: {features_scaled}")
    
    # Calculate the probability
    try:
        probability = logistic_model.predict_proba(features_scaled)[0][1]
        logger.info(f"Calculated probability: {probability}")
        return probability
    except Exception as e:
        logger.error(f"Error calculating probability: {str(e)}")
        raise
    
    return probability


def count_characters(text):
    # Simply return the length of the text
    return len(text)
    

def extract_function_words(tree):
    # Function words POS tags according to Penn Treebank
    function_word_tags = {
        'CC', 'DT', 'EX', 'IN', 'LS', 'MD', 'PDT', 'POS', 'PRP', 'PRP$', 'RP', 'TO', 'UH', 'WDT', 'WP', 'WP$', 'WRB'
    }
    
    function_words = []
    # print('tree',tree)
    # print("tree.subtrees()",tree.subtrees())
    for subtree in tree.subtrees():
        # print('subtree',subtree)
        # print("subtree.label()",subtree.label())
        if subtree.label() in function_word_tags:
            function_words.append(subtree.leaves()[0])
    
    return len(function_words)


def pos_tags_features(sentences_list):
    total_coordinated_sentence = 0
    total_subordinated_sentence = 0
    total_reduced_sentence = 0
    total_production_rules  = 0
    total_function_words = 0
    
    for data in sentences_list:
        sentences = parser.raw_parse_sents([data])
        for line in sentences:
            for sentence in line:
                data = str(sentence)
                tree = Tree.fromstring(data)
                production_rules = extract_production_rules(tree)
                function_words = extract_function_words(tree)
                total_production_rules  +=production_rules
                total_function_words +=function_words
                
                def extract_tags(tree):
                    tag_data = {}
                    def traverse(subtree):
                        tag = subtree.label()
                        if tag not in tag_data:
                            tag_data[tag] = {'count': 0, 'words': []}
                        tag_data[tag]['count'] += 1
                        tag_data[tag]['words'].extend(subtree.leaves())
                        
                        for child in subtree:
                            if isinstance(child, Tree):
                                traverse(child)
                    traverse(tree)
                    return tag_data
                
                # Extract tag data
                tag_data = extract_tags(tree)
                try:
                    cs_count = tag_data['CC']['count']
                except:
                    cs_count = 0                    

                try:        
                    ss_count = tag_data['S']['count']
                except:
                    ss_count = 0                    
        
                try:
                    vbg = tag_data['VBG']['count']
                except:                    
                    vbg = 0
                    
                try:
                    vbn = tag_data['VBN']['count']        
                except:
                    vbn = 0
        
                try:
                    vbz = tag_data['VBZ']['count'] 
                except:
                    vbz = 0
                    
                rs_count = vbn  +vbg
        
                total_coordinated_sentence += cs_count
                total_subordinated_sentence += ss_count
                total_reduced_sentence +=rs_count
    
    return total_coordinated_sentence, total_subordinated_sentence, total_reduced_sentence, production_rules, function_words
#------------------------------------------------------------------#------------------------------------------------------------------

# Counts Predicates

# Function to count predicates
def count_predicates(doc):
    predicate_count = 0
    
    for sentence in doc.sentences:
        for word in sentence.words:
            if word.upos == 'VERB':
                for dep in sentence.dependencies:
                    if (dep[0].id == word.id or dep[2].id == word.id) and dep[1] in {'nsubj', 'obj', 'iobj', 'ccomp', 'xcomp'}:
                        # print('Matching dependency:', dep)
                        predicate_count += 1
                        break  # Count each predicate only once
    return predicate_count


#------------------------------------------------------------------#------------------------------------------------------------------


def extract_production_rules(tree):
    # Extract the production rules from the tree
    productions = tree.productions()
    
    # Convert to a set to ensure uniqueness
    unique_productions = set(productions)
    
    # Define symbols to remove
    symbols_to_remove = { ',', '.'}
    
    # Filter out productions containing the specified symbols
    filtered_productions = {rule for rule in unique_productions if not any(symbol in str(rule) for symbol in symbols_to_remove)}
    
    return len(filtered_productions)

#------------------------------------------------------------------#------------------------------------------------------------------


def tokenize(text):
    """Tokenize the text into words."""
    return re.findall(r'\b\w+\b', text.lower())

def count_unique_words(text):
    """Count the total number of unique words in the text,
       excluding immediately repeated words."""
    words = tokenize(text)
    unique_words = set()

    
    # Iterate through the words and count unique words
    for i, word in enumerate(words):
        unique_words.add(word)

    return len(unique_words), len(words)


#------------------------------------------------------------------#------------------------------------------------------------------


def remove_commas_and_periods(text):
    # Remove commas and periods using regular expressions
    text = re.sub(r'[,.]', '', text)
    return text


def count_immediate_repetitions(text):
    text = remove_commas_and_periods(text)
    # Split the text into words
    words = text.split()


    # Initialize counter for immediate repetitions
    repetitions = 0

    # Iterate through the words, comparing each word with the next word
    for i in range(len(words)-1):

        if words[i] == words[i + 1]:
            
            repetitions += 1

    return repetitions


# run the generate grammar score function using main function

# if __name__ == "__main__":
#     sample_sentences = ["hi, what's up what you are doing?", "yeah. and realistically, like, yeah, like it hurts but doesn't","yeah. and realistically, like, yeah, like it hurts but doesn't","yeah. and realistically, like, yeah, like it hurts but doesn't","yeah. and realistically, like, yeah, like it hurts but doesn't","yeah. and realistically, like, yeah, like it hurts but doesn't","yeah. and realistically, like, yeah, like it hurts but doesn't","yeah. and realistically, like, yeah, like it hurts but doesn't","yeah. and realistically, like, yeah, like it hurts but doesn't","yeah. and realistically, like, yeah, like it hurts but doesn't","yeah. and realistically, like, yeah, like it hurts but doesn't","yeah. and realistically, like, yeah, like it hurts but doesn't","yeah. and realistically, like, yeah, like it hurts but doesn't","yeah. and realistically, like, yeah, like it hurts but doesn't","yeah. and realistically, like, yeah, like it hurts but doesn't","yeah. and realistically, like, yeah, like it hurts but doesn't"]
#     duration = 10
#     grammer_scores = generate_grammar_score(sample_sentences, duration)

#     print(grammer_scores)
