import {Ollama} from "@langchain/community/llms/ollama";
import {PromptTemplate} from "@langchain/core/prompts";
import {RunnableSequence} from "@langchain/core/runnables";

const textExample = `
Donald John Trump, born on June 14, 1946, in Queens, New York City, is a prominent American businessman, television personality, and politician. He served as the 45th president of the United States from January 20, 2017, to January 20, 2021 . Trump's political career began with his announcement of running for president in 2015, which marked a significant departure from his previous roles primarily focused on business and entertainment .

Trump's journey to the presidency was marked by controversy and innovation. He became the first person elected as president without prior experience in public service . His campaign strategy included leveraging social media extensively and making bold promises such as building a wall along the Mexican border and implementing a travel ban on certain countries 
. These strategies helped him secure the Republican nomination and eventually win the presidency in 2016 against Hillary Clinton .

During his presidency, Trump implemented several policies that had profound impacts on various aspects of American life. He presided over major tax reforms, appointed three Supreme Court Justices, established the sixth branch of the U.S. Armed Forces, and signed into law the First Step Act, which addressed mass incarceration at the federal level 
. His administration also withdrew from some international agreements and redefined U.S. foreign policy with a focus on "America First" .

Trump's tenure was characterized by both achievements and controversies. He was impeached twice by the U.S. House of Representatives; once in 2019 for abuse of power and obstruction of Congress, and again in 2021 following the January 6 insurrection at the Capitol. However, he was acquitted both times by the Senate .

After leaving office, Trump continued to be a significant figure in American politics. He announced his candidacy for president again in the 2024 election and successfully secured the Republican nomination . Despite facing legal challenges and criticism, Trump remains an influential figure within the GOP and continues to engage actively in political discourse .

Donald Trump is a complex figure whose impact on modern American politics is multifaceted and deeply polarizing. His presidency reflected a blend of traditional conservative values and innovative approaches to governance, making him a highly controversial yet influential leader .
`

const prompt = `
Generate an mind mapping for based on the requirements below:

"""
The output result must be pure text with no introduction
Don't use double quotation marks
Don't include FAQs
The output result should be presented in an organized structure
Text to be generate: {content}
The output result should exactly follow the format below, and each part should include no more than 3 subheadings and each leaf part should be within 50 characters under each part, and don't ignore empty lines and --- in the format: 
## This is the first part of the example returned by the mind mapping 
### This is the first subpart
### This is the second subpart
### This is the third subpart
   
---

## This is the second title of the example returned by the mind mapping
### This is the first subpart
### This is the second subpart
   
---

## This is the third title of the example returned by the mind mapping
### This is the first subpart
### This is the second subpart

---

## This is the fourth title of the example returned by the mind mapping
### This is the first subpart
### This is the second subpart
`;

const model = new Ollama({
    model: "llama3",
});

const promptTemplate = PromptTemplate.fromTemplate(
    prompt
);

const chain = RunnableSequence.from([
    promptTemplate,
    model as any
]);

async function main (){
    const result = await chain.invoke({content: textExample});
    console.log(result);
}

main();
